import uuid from "uuid4";

import TapeLooperAudio from '../Sources/TapeLooper/TapeLooperAudio';
import PanAudio from '../Effects/Pan/PanAudio';
import FilterAudio from '../Effects/Filter/FilterAudio';
import GainAudio from '../Effects/Gain/GainAudio';
import CompressorAudio from '../Effects/Compressor/CompressorAudio';
import { EffectType } from '../Effects/EffectTypes'
import { SourceType } from '../Sources/SourceTypes';
import { arrayMove } from 'react-sortable-hoc';


class RackAudio {
    constructor(audioGraph) {
        this.source = null;
        this.graph = audioGraph;
        this.effects = [];

        // Todo: global fx rack
        this.destination = this.graph.context.destination;
    }

    pause() {
        this.source.pause();
    }

    play() {
        this.source.play();
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
        const sourceAudios = { [SourceType.TapeLooper]: TapeLooperAudio };
        const defaultSourceAudio = TapeLooperAudio;
        const Source = sourceAudios[sourceType] || defaultSourceAudio;
        this.source = new Source(this);
        const id = uuid();
        this.graph.sources[id] = this.source;
        return id;
    }

    get startOfFxChain() {
        return (this.effects[0] && this.effects[0].node) || this.destination;
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
            [EffectType.Compressor]: CompressorAudio
        };
        const defaultEffectAudio = FilterAudio;
        const EffectAudio = effectAudios[effectType] || defaultEffectAudio
        let effect = new EffectAudio(this)
        const lastOutput = this.currentOutput;
        this.effects.push(effect);

        // Add an ID to register this effect.
        const id = uuid();
        this.graph.effects[id] = effect;
        effect.id = id;

        // Route the current output to this effect.
        if (lastOutput) lastOutput.routeTo(effect);
        effect.routeTo(this.destination);
        return id;
    }
}

export default RackAudio;