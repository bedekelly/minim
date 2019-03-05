import EffectAudio from '../EffectAudio';


export default class BitCrusherAudio extends EffectAudio {
    constructor(parentRack) {
        super(parentRack);
        this.node = new AudioWorkletNode(this.context, 'bit-crusher-processor');
        this._bitDepth = this.node.parameters.get('bitDepth');
        this._reduction = this.node.parameters.get('frequencyReduction');
        this.bitDepth = 12;
        this.frequencyReduction = 0.5;
    }
    
    set bitDepth(value) {
        this._bitDepth.setValueAtTime(value, 0);
    }
    
    get bitDepth() {
        return this._bitDepth.value;
    }
    
    set frequencyReduction(value) {
        this._reduction.setValueAtTime(value, 0);
    }
    
    get frequencyReduction() {
        return this._reduction.value;
    }
}