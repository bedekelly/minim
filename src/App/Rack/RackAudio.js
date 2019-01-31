import uuid from "uuid4";

import PanAudio from '../Effects/Pan/PanAudio';
import FilterAudio from '../Effects/Filter/FilterAudio';
import GainAudio from '../Effects/Gain/GainAudio';
import CompressorAudio from '../Effects/Compressor/CompressorAudio';
import ReverbAudio from '../Effects/Reverb/ReverbAudio';
import SequencerAudio from './SequencerAudio';
import EchoAudio from '../Effects/Echo/EchoAudio'

import { EffectType } from '../Effects/EffectTypes'
import { SourceTypes } from '../Sources/SourceTypes';
import { arrayMove } from 'react-sortable-hoc';


class RackAudio {

    constructor(appAudio) {
        this.source = null;
        this.sequencer = new SequencerAudio(appAudio.context);
        this.appAudio = appAudio;
        this.effects = [];

        // Todo: global fx rack
        this.destination = this.appAudio.context.destination;

        const notes = [
            { data: [144, 36, 123], beat: 0, offset: 0 },
            { data: [144, 36], beat: 1, offset: 0 },
            { data: [144, 36], beat: 2, offset: 0},
            { data: [144, 36], beat: 3, offset: 0},
            { data: [144, 38], beat: 3, offset: 50}
        ];
        this.sequencer.bpm = 200;
        this.sequencer.addNotes(notes);
    }

    pause() {
        this.sequencer.pause();
        this.source && this.source.pause();
    }

    play() {
        this.sequencer.play();
        this.source && this.source.play();
    }

    midiMessage(message) {
        this.source && this.source.midiMessage(message);
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
        this.appAudio.unregisterComponent(id);
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
        this.sequencer.sendNotesTo(this.source);
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
            [EffectType.Echo]: EchoAudio
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