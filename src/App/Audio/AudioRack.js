import uuid from "uuid4";

import TapeLooperAudio from './TapeLooperAudio';
import { PanAudio, FilterAudio } from './Effects';
import { EffectType } from '../utils/EffectTypes'
import { SourceType } from '../utils/SourceTypes';


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