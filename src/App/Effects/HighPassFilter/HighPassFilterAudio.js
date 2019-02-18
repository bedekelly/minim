import EffectAudio from '../EffectAudio';


class HighPassFilterAudio extends EffectAudio {
    constructor(parentRack) {
        super(parentRack);
        const filter = this.node = this.context.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.setValueAtTime(1000, this.context.currentTime);
        filter.Q.setValueAtTime(1.5, this.context.currentTime);
        filter.gain.setValueAtTime(3, this.context.currentTime);
        this._value = 1000;
    }
    
    set value(value) {
        this.node.frequency.setValueAtTime(value, this.context.currentTime);
        this._value = value;
    }
    
    get value() {
        return this._value;
    }
}


export default HighPassFilterAudio;