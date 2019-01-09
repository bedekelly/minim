import Effect from '../Effect';


class PanAudio extends Effect {
    constructor(parentRack) {
        super(parentRack);
        this.node = this.context.createStereoPanner();
    }
    
    setValue(value) {
        this.node.pan.setValueAtTime(value, 0);
    }
}


export default PanAudio;