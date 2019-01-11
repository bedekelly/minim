import EffectAudio from '../EffectAudio';

class FilterAudio extends EffectAudio {
    constructor(parentRack) {
        super(parentRack);
        const filter = this.node = this.context.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1000, this.context.currentTime);
        filter.Q.setValueAtTime(1.5, this.context.currentTime);
        filter.gain.setValueAtTime(3, this.context.currentTime);
        this.sliderValue = 2500;
    }
    
    setValue(sliderValue) {
        this.sliderValue = sliderValue;
        const scaledValue = sliderValue;
        this.node.frequency.setValueAtTime(scaledValue, this.context.currentTime);
    }
}

export default FilterAudio;