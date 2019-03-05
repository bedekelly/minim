import EffectAudio from '../EffectAudio';

class GainAudio extends EffectAudio {
    
    constructor(...args) {
        super(...args);
        this.node = this.context.createGain();
        this.node.gain.setValueAtTime(1, 0);
        this._value = 1;
    }
    
    set value(value) {
        this.node.gain.setValueAtTime(value, 0);
        this._value = value;
    }
    
    get value() {
        return this._value;
    }
}

export default GainAudio;