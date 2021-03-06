import uuid from "uuid4";

import PanAudio from './Effects/Pan/PanAudio';
import FilterAudio from './Effects/Filter/FilterAudio';
import HighPassFilterAudio from './Effects/HighPassFilter/HighPassFilterAudio';
import GainAudio from './Effects/Gain/GainAudio';
import CompressorAudio from './Effects/Compressor/CompressorAudio';
import ReverbAudio from './Effects/Reverb/ReverbAudio';
import EchoAudio from './Effects/Echo/EchoAudio';
import DistortionAudio from './Effects/Distortion/DistortionAudio';
import BitCrusherAudio from './Effects/BitCrusher/BitCrusherAudio';

import SequencerAudio from './Sequencer/SequencerAudio';
import RecorderAudio from './Recorder/RecorderAudio';

import { EffectType } from './Effects/EffectTypes'
import { SourceTypes } from './Sources/SourceTypes';
import { arrayMove } from 'react-sortable-hoc';


class RackAudio {

    constructor(appAudio) {
        this.source = null;
        this.appAudio = appAudio;
        this.effects = [];

        this.destination = this.appAudio.startOfFxChain;
        this.output = this.appAudio.context.createGain();
        this.output.connect(this.destination);
    }

    addSequencer() {
        this.sequencer = new SequencerAudio(this.appAudio.context);
        if (this.source) {
            this.sequencer.sendNotesTo(this.source);
        }
    }

    addRecorder() {
        this.recorder = new RecorderAudio(this.appAudio);
        if (this.source) {
            this.recorder.sendNotesTo(this.source);
        }
    }

    pause() {
        console.log("rack pausing");
        this.sequencer && this.sequencer.pause();
        this.recorder && this.recorder.pause();
        this.source && this.source.pause && this.source.pause();
    }

    play() {
        console.log("rack playing");
        this.recorder && this.recorder.play();
        this.sequencer && this.sequencer.play();
        this.source && this.source.play && this.source.play();
    }
    
    stop() {
        this.recorder && this.recorder.stop();
        this.sequencer && this.sequencer.stop();
        this.source && this.source.stop && this.source.stop();
    }

    midiMessage(message) {
        if (this.recorder && this.recorder.playing && this.recorder.recording) {
            this.recorder.midiMessage(message);
        } else {
            this.source && this.source.midiMessage ? 
                this.source.midiMessage(message)
                : console.warn("Sent MIDI messages to a source who doesn't support it.");
        }
    }

    removeEffect(id) {
        // Find and connect the old input and output of this effect.
        const effectIndex = this.effects.findIndex(effect => effect.id === id);
        const oldInput = this.inputOf(effectIndex);
        const oldOutput = this.outputOf(effectIndex);
        if (oldInput !== null) oldInput.routeTo(oldOutput);

        // Clean up the effect by disconnecting it.
        const effect = this.effects[effectIndex];
        effect.disconnect();

        // Remove the effect from this rack's list.
        this.effects.splice(effectIndex, 1);
        
        // Unregister component for MIDI messages.
        // Todo: reinstate this.
        this.appAudio.unregisterAllHandlers(id);
    }

    outputOf(index) {
        return (index >= this.effects.length-1) ? 
            this.output : this.effects[index+1];
    }

    inputOf(index) {
        return (index > 0) ? 
            this.effects[index-1] : this.source;
    }

    moveEffect({oldIndex, newIndex}) {
        // A -> E -> B becomes A -> B.
        const oldOutput = this.outputOf(oldIndex);
        const oldInput = this.inputOf(oldIndex);
        const effect = this.effects[oldIndex];
        if (oldInput) oldInput.routeTo(oldOutput);

        // Transform our effects array to match the components.
        this.effects = arrayMove(this.effects, oldIndex, newIndex);

        // C -> D becomes C -> E -> D.
        const newInput = this.inputOf(newIndex);
        const newOutput = this.outputOf(newIndex);

        if (newInput) newInput.routeTo(effect);
        effect.routeTo(newOutput);
    }

    addSource(sourceType) {
        const { audio, component } = SourceTypes.find(t => t.type === sourceType);
        this.source = new audio(this);
        this.source.routeTo(this.startOfFxChain);
        const id = uuid();
        this.appAudio.sources[id] = this.source;
        if (this.sequencer) this.sequencer.sendNotesTo(this.source);
        if (this.recorder) this.recorder.sendNotesTo(this.source);
        return { id, component };
    }

    get startOfFxChain() {
        return (this.effects[0] && this.effects[0].input) || this.output;
    }
    
    updateOutput() {
        this.destination = this.appAudio.startOfFxChain;
        this.output.disconnect();
        this.output.connect(this.destination);
    }

    get currentOutput() {
        return this.effects[this.effects.length-1] || this.source;
    }
    
    addEffect(effectType) {
        // Make an EffectAudio and add it to this rack's effect.
        const effectAudios = {
            [EffectType.Pan]: PanAudio,
            [EffectType.Filter]: FilterAudio,
            [EffectType.HighPassFilter]: HighPassFilterAudio,
            [EffectType.Gain]: GainAudio,
            [EffectType.Compressor]: CompressorAudio,
            [EffectType.Reverb]: ReverbAudio,
            [EffectType.Echo]: EchoAudio,
            [EffectType.Distortion]: DistortionAudio,
            [EffectType.BitCrusher]: BitCrusherAudio
        };
        const defaultEffectAudio = FilterAudio;
        const EffectAudio = effectAudios[effectType] || defaultEffectAudio
        let effect = new EffectAudio(this)
        const lastOutput = this.currentOutput;
        this.effects.push(effect);

        // Add an ID to register this effect.
        const id = uuid();
        this.appAudio.effects[id] = effect;
        effect.id = id;

        // Route the current output to this effect.
        if (lastOutput) lastOutput.routeTo(effect);
        effect.routeTo(this.output);
        return id;
    }
    
    mute() {
        this.muted = true;
        this.output.gain.setValueAtTime(0, 0);
        this.recorder && this.recorder.rackMuteMetronome();
    }
    
    unmute() {
        this.muted = false;
        this.output.gain.setValueAtTime(1, 0);
        this.recorder && this.recorder.rackUnmuteMetronome();
    }
}

export default RackAudio;