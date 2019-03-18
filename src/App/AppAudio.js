import uuid from "uuid4";

import RackAudio from './Rack/RackAudio';
import { arrayMove } from 'react-sortable-hoc';
import PanAudio from './Rack/Effects/Pan/PanAudio';
import FilterAudio from './Rack/Effects/Filter/FilterAudio';
import GainAudio from './Rack/Effects/Gain/GainAudio';
import CompressorAudio from './Rack/Effects/Compressor/CompressorAudio';
import ReverbAudio from './Rack/Effects/Reverb/ReverbAudio';
import EchoAudio from './Rack/Effects/Echo/EchoAudio';
import DistortionAudio from './Rack/Effects/Distortion/DistortionAudio';
import BitCrusherAudio from './Rack/Effects/BitCrusher/BitCrusherAudio';

import Recorder from './Recorder.js';

import RecorderWorklet from 'worklet-loader!./Worklets/recorder-worklet.js';
import BitCrusherWorklet from 'worklet-loader!./Worklets/bit-crusher.js';

import { EffectType } from './Rack/Effects/EffectTypes'


class AppAudio {

    processors = [ RecorderWorklet, BitCrusherWorklet ];

    constructor() {
        this.racks = {};
        this.sources = {};
        this.effects = {};
        this.globalEffects = [];
        this.midiControlledComponents = {};
        this.context = null;
        this.componentMidiHandlers = {};
        this.selectedRack = null;
        this.learningMidi = false;
        this.midiLearnTarget = null;
        this.setupMidi();
        this.recording = false;
        this.recordingOutput = null;
    }

    onMidiMessage(input, message) {
        let control, value;
        let isControlMessage = (message.data[0] >> 4 === 11)
        if (isControlMessage) {
            control = message.data[1];
            value = message.data[2];
        }

        // Currently learn MIDI, so swallow the next component input.
        if (isControlMessage && this.learningMidi) {
            // Assign the control to the current midi learn target.
            if (this.midiControlledComponents[input.id] === undefined) 
                this.midiControlledComponents[input.id] = {};
            this.midiControlledComponents[input.id][control] = this.midiLearnTarget;

            // Reset our state so controllers work normally again.
            this.learningMidi = false;
            this.setLearning && this.setLearning(false);
            this.midiLearnTarget = null;
        } 

        // Control has been MIDI-learned, so delegate to the component's handler.
        else if (isControlMessage && this.midiControlledComponents[input.id] && this.midiControlledComponents[input.id][control]) {
            const componentId = this.midiControlledComponents[input.id][control];
            const handler = this.componentMidiHandlers[componentId];
            handler(value);
        } 
        
        // Otherwise, just send the MIDI message to the current rack.
        else {
            const rack = this.racks[this.selectedRack];
            rack && rack.midiMessage(message)
        }
    }

    registerHandler(componentId, handler) {
        this.componentMidiHandlers[componentId] = handler;
    }

    outputOf(index) {
        return (index >= this.globalEffects.length-1) ? 
            this.recordingOutput : this.globalEffects[index+1];
    }

    inputOf(index) {
        return (index > 0) ? 
            this.globalEffects[index-1] : null;
    }

    updateOutputs() {
        for (let rack of Object.values(this.racks)) {
            rack.updateOutput();
        }
        if (this.currentOutput) {
            this.currentOutput.routeTo(this.recordingOutput);
        }
    }

    unregisterAllHandlers(componentId) {
        for (let input of Object.keys(this.midiControlledComponents)) {
            for (let control of Object.keys(this.midiControlledComponents[input])) {
                const handler = this.midiControlledComponents[input][control]
                if (handler.id === componentId ) {
                    delete this.midiControlledComponents[input][control];
                }
            }
        }
    }

    setupInput(input) {
        input.onmidimessage = message => this.onMidiMessage(input, message);
    }

    async setupMidi() {
        const midiAccess = await navigator.requestMIDIAccess({ sysex: false })
        for (let input of midiAccess.inputs.values()) {
            this.setupInput(input);
        }
        midiAccess.onstatechange = (event => {
            for (let input of event.target.inputs.values()) {
                this.setupInput(input);
            }
        })
    }

    addGlobalEffect(effectType) {
        // Make an EffectAudio and add it to this rack's effect.
        const effectAudios = {
            [EffectType.Pan]: PanAudio,
            [EffectType.Filter]: FilterAudio,
            [EffectType.Gain]: GainAudio,
            [EffectType.Compressor]: CompressorAudio,
            [EffectType.Reverb]: ReverbAudio,
            [EffectType.Echo]: EchoAudio,
            [EffectType.Distortion]: DistortionAudio,
            [EffectType.BitCrusher]: BitCrusherAudio
        };
        const defaultEffectAudio = FilterAudio;
        const EffectAudio = effectAudios[effectType] || defaultEffectAudio;
        let effect = new EffectAudio(this);
        const lastOutput = this.currentOutput;
        this.globalEffects.push(effect);

        // Add an ID to register this effect.
        const id = uuid();
        this.effects[id] = effect;
        effect.id = id;

        // Route the current output to this effect.
        if (lastOutput) lastOutput.routeTo(effect);
        effect.routeTo(this.recordingOutput);
        
        this.updateOutputs();
        
        return id;
    }
    
    removeGlobalEffect(id) {
        // Find and connect the old input and output of this effect.
        const effectIndex = this.globalEffects.findIndex(effect => effect.id === id);
        const oldInput = this.inputOf(effectIndex);
        const oldOutput = this.outputOf(effectIndex);
        if (oldInput) oldInput.routeTo(oldOutput);

        // Clean up the effect by disconnecting it.
        const effect = this.globalEffects[effectIndex];
        effect.disconnect();

        // Remove the effect from this rack's list.
        this.globalEffects.splice(effectIndex, 1);
        
        // Unregister component for MIDI messages.
        // Todo: reinstate this.
        this.unregisterAllHandlers(id);
        
        this.updateOutputs();
    }
    
    moveGlobalEffect({oldIndex, newIndex}) {
        
        // A -> E -> B becomes A -> B.
        const oldOutput = this.outputOf(oldIndex);
        const oldInput = this.inputOf(oldIndex);
        const effect = this.globalEffects[oldIndex];
        if (oldInput) oldInput.routeTo(oldOutput);
        
        // Transform our effects array to match the components.
        this.globalEffects = arrayMove(this.globalEffects, oldIndex, newIndex);

        // C -> D becomes C -> E -> D.
        const newInput = this.inputOf(newIndex);
        const newOutput = this.outputOf(newIndex);

        if (newInput) newInput.routeTo(effect);
        effect.routeTo(newOutput);
        
        this.updateOutputs();
    }
    
    midiLearn(componentId) {
        this.learningMidi = true;
        this.midiLearnTarget = componentId;
        this.setLearning && this.setLearning(true);
    }
    
    stopLearning() {
        this.learningMidi = false;
        this.midiLearnTarget = null;
        this.setLearning && this.setLearning(false);
    }

    playAll() {
        this.playing = true;
        for (let source of Object.values(this.racks)) {
            source.play();
        }
    }

    get destination() {
        return this.startOfFxChain;
    }
    
    get startOfFxChain() {
        return (this.globalEffects[0] && this.globalEffects[0].input) || this.recordingOutput;
    }
    
    get currentOutput() {
        return this.globalEffects[this.globalEffects.length-1] || this.source;
    }

    pauseAll() {
        this.playing = false;
        for (let source of Object.values(this.racks)) {
            source.pause();
        }
    }

    stopAll() {
        this.playing = false;
        for (let rack of Object.values(this.racks)) {
            rack.stop();
        }
    }

    async initialise() {
        await this.makeContext();
        console.log("Created context successfully");
        this.recordingOutput = this.context.createGain();
        this.recordingOutput.connect(this.context.destination);
        return this.loadProcessors();
    }
    
    async loadProcessors() {
        for (let worklet of this.processors) {
            // Todo: use Promise.all() here to allow asynchronous loading.
            try {
                await this.context.audioWorklet.addModule(`worklets/${worklet}.js`);
            } catch (e) {
                console.warn("Failed to load ", worklet);
            }

        }
    }

    async makeContext() {
        if (this.context) return this.context;
        const context = new (window.AudioContext || window.webkitAudioContext)();

        // Unlock audio context for iOS devices.
        if (context.state === 'suspended' && 'ontouchstart' in window) {
            try {
                await context.resume();
            } catch (e) {
                console.log("Error resuming context.")
            }
        }

        this.context = context;
    }
    
    selectRack(id) {
        this.selectedRack = id;
    }
    
    async makeRack() {
        const rack = new RackAudio(this);
        const id = uuid();
        this.racks[id] = rack;
        this.selectedRack = id;
        return { id };
    }
    
    deleteRack(id) {
        const rack = this.racks[id];
        rack.output.disconnect();
        delete this.racks[id];
    }

    record() {
        console.log("Record");
        this.recorder = new Recorder(this.recordingOutput);
        this.recorder.record();
        this.recording = true;
    }

    stopRecording() {
        console.log("Stop recording");
        this.recording = false;
        this.recorder.stop();
        this.recorder.exportWAV(blob => Recorder.download( blob, "Recording" ) );
    }
}


export default AppAudio;