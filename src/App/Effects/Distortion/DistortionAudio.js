import EffectAudio from '../EffectAudio';


/**
 * Linearly map a value from one range to another.
 */
function linMap(value, fromLower, fromUpper, toLower, toUpper) {
    const lowerRange = fromUpper - fromLower;
    const upperRange = toUpper - toLower;
    const magnitudeThroughLowerRange = (value - fromLower);
    const fractionThroughRange = magnitudeThroughLowerRange / lowerRange;
    const magnitudeThroughUpperRange = fractionThroughRange * upperRange;
    const valueInUpperRange = toLower + magnitudeThroughUpperRange;
    return valueInUpperRange;
}


const MAX_DISTORTION = 16;
const MAX_CUT = 10;


export default class DistortionAudio extends EffectAudio {

    constructor(parentRack) {
        super(parentRack);
        this.setupNodes();
        this.offset = 0.05;
        this.amount = 0.01;
        this.max = MAX_DISTORTION;
    }

/*
this.startFilterNode = this.context.createBiquadFilter();
this.startFilterNode.type = "highpass";
this.startFilterNode.frequency.setValueAtTime(3000, 0);
*/

    setupNodes() {
        this.inputNode = this.distortionNode = this.context.createWaveShaper();
        this.filterNode = this.outputNode = this.context.createBiquadFilter();
        this.filterNode.type = "highshelf";
        this.filterNode.frequency.setValueAtTime(5000, 0);
        // this.filterNode.gain.setValueAtTime(0, 0);

        this.inputNode.connect(this.outputNode);

        window.setHighShelfCut = gain => this.filterNode.gain.setValueAtTime(gain, 0);
        window.setLowCut = freq => this.startFilterNode.frequency.setValueAtTime(freq, 0);
        window.setOffset = offset => {
            this.offset = offset;
            this.distortionNode.curve = DistortionAudio.makeDistortionCurve(this._amount);
        }
    }

    set amount(value) {
        this._amount = value;
        this.distortionNode.curve = DistortionAudio.makeDistortionCurve(value, this.offset, DistortionAudio.curve);
        const dBCut = linMap(value, 0, MAX_DISTORTION, 0, MAX_CUT);
        this.filterNode.gain.setValueAtTime(-dBCut, 0);
    }

    get amount() {
        return this._amount;
    }


    static curve(x, k, offset) {
        // return (Math.PI + k) * x / (Math.PI + k * Math.abs(x));
        const curveValue = offset + (Math.PI + k) * x / (Math.PI + k * Math.abs(x)) + Math.abs(x)/MAX_DISTORTION;
        return Math.min(1, curveValue);
    }

    static makeDistortionCurve(k, offset, curve) {
        let sampleRate = 44100;
        let curveData = new Float32Array(sampleRate);
        for (let i=0; i < sampleRate; i++) {
            let x = i * 2 / sampleRate - 1;
            curveData[i] = curve(x, k, offset);
        }
        return curveData;
    }
}
