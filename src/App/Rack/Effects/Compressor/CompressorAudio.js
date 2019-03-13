import EffectAudio from '../EffectAudio';


class CompressorAudio extends EffectAudio {
    constructor(...args) {
        super(...args);
        this.node = this.context.createDynamicsCompressor();
        
        // Default ratio of 12 is pretty hardcore.
        this.node.ratio.setValueAtTime(1.5, 0);
        this.ratioChanged = false;  // Sort out a nasty race condition.
    }

    setValue(name, value) {
        return this.node[name].setValueAtTime(value, this.context.currentTime);
    }

    get threshold() { return this.node.threshold.value; }
    get knee() { return this.node.knee.value; }
    
    get attack() { return this.node.attack.value; }
    get release() { return this.node.release.value; }
    get ratio() {
        if (!this.ratioChanged) return 1.5;
        return this.node.ratio.value;
    }
    
    set threshold(value) { return this.setValue("threshold", value); }
    set knee(value) { return this.setValue("knee", value); }
    set attack(value) { return this.setValue("attack", value); }
    set release(value) { return this.setValue("release", value); }
    set ratio(value) {
        this.ratioChanged = true;
        return this.setValue("ratio", value);
    }
}


export default CompressorAudio;