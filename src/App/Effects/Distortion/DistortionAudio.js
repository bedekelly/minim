import EffectAudio from '../EffectAudio';

export default class DistortionAudio extends EffectAudio {

    constructor(parentRack) {
        super(parentRack);
        this.input = this.context.createGain();
        this.node = this.context.createGain();
    }
    
    routeTo(destination) {
        console.log("route distortion audio pls");
    }
}