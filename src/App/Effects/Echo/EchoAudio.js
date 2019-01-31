import EffectAudio from '../EffectAudio';


export default class EchoAudio extends EffectAudio {
    constructor(parentAudio) {
        super(parentAudio);

        // Create nodes for echo effect.
        this.delayNode = this.context.createDelay();
        this.cutoffNode = this.context.createBiquadFilter();
        this.feedbackNode = this.context.createGain();

        // Connect internal loop for echo effect.
        this.delayNode.connect(this.cutoffNode);
        this.cutoffNode.connect(this.feedbackNode);
        this.feedbackNode.connect(this.delayNode);

        // Set ingress and egress points.
        this.inputNode = this.delayNode;
        this.outputNode = this.cutoffNode;

        // Set some defaults.
        this.feedback = 0;
        this.cutoff = 10000;
        this.time = 0.3;
    }

    set feedback(value) {
        this.feedbackNode.gain.setValueAtTime(value, 0);
    }

    get feedback() {
        return this.feedbackNode.gain.value;
    }

    set cutoff(value) {
        this.cutoffNode.frequency.setValueAtTime(value, 0);
    }

    get cutoff() {
        return this.cutoffNode.frequency.value;
    }

    set time(value) {
        this.delayNode.delayTime.setValueAtTime(value, 0);
    }

    get time() {
        return this.delayNode.delayTime.value;
    }
}
