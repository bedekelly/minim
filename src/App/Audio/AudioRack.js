import uuid from "uuid4";

import TapeLooperAudio from './TapeLooperAudio';
import { PanAudio, FilterAudio } from './Effects';
import { EffectType } from '../utils/EffectTypes'
import { SourceType } from '../utils/SourceTypes';
import { arrayMove } from 'react-sortable-hoc';

class AudioRack {
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
        oldInput.routeTo(oldOutput);
        
        // Transform our effects array to match the components.
        this.effects = arrayMove(this.effects, oldIndex, newIndex)

        // C -> D becomes C -> E -> D.
        const newInput = this.inputOf(newIndex);
        const newOutput = this.outputOf(newIndex);
        newInput.routeTo(effect);
        effect.routeTo(newOutput);
    }
    
    addSource(sourceType) {
        switch(sourceType) {
            case SourceType.TapeLooper:
            default: {
                this.source = new TapeLooperAudio(this);
            }
        }

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
        let effect;
        const lastOutput = this.currentOutput;
        switch(effectType) {
            case EffectType.Pan: {
                effect = new PanAudio(this);
                this.effects.push(effect);
                break;
            }
            case EffectType.Filter:
            default: {
                effect = new FilterAudio(this);
                this.effects.push(effect);
            }
        }
        const id = uuid();
        this.graph.effects[id] = effect;
        
        if (lastOutput) {
            lastOutput.routeTo(effect);
        }
        effect.routeTo(this.destination);
        
        return id;
    }
}

export default AudioRack;