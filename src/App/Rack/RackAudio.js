import uuid from "uuid4";

import PanAudio from '../Effects/Pan/PanAudio';
import FilterAudio from '../Effects/Filter/FilterAudio';
import GainAudio from '../Effects/Gain/GainAudio';
import CompressorAudio from '../Effects/Compressor/CompressorAudio';
import ReverbAudio from '../Effects/Reverb/ReverbAudio';
import EchoAudio from '../Effects/Echo/EchoAudio';
import DistortionAudio from '../Effects/Distortion/DistortionAudio';
import BitCrusherAudio from '../Effects/BitCrusher/BitCrusherAudio';

import SequencerAudio from './SequencerAudio';
import RecorderAudio from './RecorderAudio';

import { EffectType } from '../Effects/EffectTypes'
import { SourceTypes } from '../Sources/SourceTypes';
import { arrayMove } from 'react-sortable-hoc';


class RackAudio {

    constructor(appAudio) {
        this.source = null;
        this.sequencer = new SequencerAudio(appAudio.context);
        this.recorder = new RecorderAudio(appAudio.context);
        this.appAudio = appAudio;
        this.effects = [];

        // Todo: global fx rack
        this.destination = this.appAudio.context.destination;
        // this.sequencer.bpm = 80;
    }

    pause() {
        console.log("rack pausing");
        this.sequencer && this.sequencer.pause();
        this.recorder && this.recorder.pause();
        this.source && this.source.pause();
    }

    play() {
        console.log("rack playing");
        this.recorder && this.recorder.play();
        this.sequencer && this.sequencer.play();
        this.source && this.source.play();
    }

    midiMessage(message) {
        if (this.recorder) {
            this.recorder.midiMessage(message);
            return;
        }
        
        this.source && this.source.midiMessage ? 
            this.source.midiMessage(message)
            : console.warn("Sent MIDI messages to a source who doesn't support it.");
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
            this.destination : this.effects[index+1];
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
        return (this.effects[0] && this.effects[0].input) || this.destination;
    }

    get currentOutput() {
        return this.effects[this.effects.length-1] || this.source;
    }
    
    addEffect(effectType) {
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
        effect.routeTo(this.destination);
        return id;
    }
}

export default RackAudio;