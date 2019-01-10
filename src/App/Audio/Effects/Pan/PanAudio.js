import Effect from '../Effect';


class PanAudio extends Effect {
    constructor(parentRack) {
        super(parentRack);
        this.node = this.context.createStereoPanner();
        this.sliderValue = 50;
    }
    
    setValue(sliderValue) {
        const scaledValue = sliderValue / 50 - 1;
        this.node.pan.setValueAtTime(scaledValue, 0);
        this.sliderValue = sliderValue;
    }
}


export default PanAudio;