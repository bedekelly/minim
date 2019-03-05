import EffectAudio from '../EffectAudio';


class PanAudio extends EffectAudio {
    constructor(parentRack) {
        super(parentRack);
        this.node = this.context.createStereoPanner();
        this._value = 0;
    }

    set value(value) {
        this.node.pan.setValueAtTime(value, 0);
        this._value = value;
    }
    
    get value() {
        return this._value;
    }
}


export default PanAudio;