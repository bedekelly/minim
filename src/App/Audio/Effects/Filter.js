import Effect from './Effect';

class FilterAudio extends Effect {
    constructor(parentRack) {
        super(parentRack);
        const filter = this.node = this.context.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1000, this.context.currentTime);
        filter.Q.setValueAtTime(1.5, this.context.currentTime);
        filter.gain.setValueAtTime(3, this.context.currentTime);
    }
    
    setValue(value) {
        this.node.frequency.setValueAtTime(value, this.context.currentTime);
    }
}

export default FilterAudio;