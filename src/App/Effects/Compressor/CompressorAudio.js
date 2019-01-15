import EffectAudio from '../EffectAudio';


class CompressorAudio extends EffectAudio {
    constructor(...args) {
        super(...args);
        this.node = this.context.createDynamicsCompressor();
    }

    setValue(name, value) {
        return this.node[name].setValueAtTime(value, this.context.currentTime);
    }

    get threshold() { return this.node.threshold.value; }
    get knee() { return this.node.knee.value; }
    get ratio() { return this.node.ratio.value; }
    get attack() { return this.node.attack.value; }
    get release() { return this.node.release.value; }
    
    set threshold(value) { return this.setValue("threshold", value); }
    set knee(value) { return this.setValue("knee", value); }
    set ratio(value) { return this.setValue("ratio", value); }
    set attack(value) { return this.setValue("attack", value); }
    set release(value) { return this.setValue("release", value); }
}


export default CompressorAudio;