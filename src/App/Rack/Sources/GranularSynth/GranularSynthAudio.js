import uuid from 'uuid4';

const CLEANUP_INTERVAL = 500;  // ms
const CLEANUP_WINDOW = 5;  // s

const NOTE_ON = 144;


/**
 * Clamp a value to the range lower <= value <= upper.
 */
function bounded(value, lower, upper) {
  if (value > upper) return upper;
  if (value < lower) return lower;
  return value;
}


function gaussianRand(tightness) {
    tightness = tightness || 6;
    let rand = 0;
    for (let i = 0; i < tightness; i++) {
        rand += Math.random();
    }
    return rand / tightness;
}


export default class GranularSynthAudio {
    constructor(parentRack) {
        this.parentRack = parentRack;
        this.appAudio = parentRack.appAudio;
        this.context = this.appAudio.context;
        this.maxLength = 3;

        this.tightness = 40;
        this.attack = 1;
        this.release = 1;
        this.targetConstant = 1/3;

        this.grainLength = 0.05;
        this.grainOverlap = -0.3;
        this.grainAttack = this.grainLength/6;
        this.grainRelease = this.grainLength/6;
        this.grainPosition = Math.random();
        this.nodes = [];
        this.startCleanup();
    }

    get grainSpacing() {
        return this.grainLength * (1 + this.grainOverlap);
    }
    
    get spray() {
        return 100 - this.tightness;
    }
    
    set spray(value) {
        this.tightness = 100 - value;
    }

    get numGrains() {
        return this.maxLength / this.grainSpacing;
    }

    cleanup() {
        const now = this.context.currentTime;
        let i = 0;
        const nodesToRemove = [];
        for (let { nodeEndTime, node, nodeGain } of this.nodes) {
            if (now > nodeEndTime + CLEANUP_WINDOW) {
                console.log("Cleaning up node");
                node.disconnect();
                nodeGain.disconnect();
                nodesToRemove.push(i);
            }
            i++;
        }
        for (let i of nodesToRemove) {
            this.nodes.splice(i, 1);
        }
    }
    
    startCleanup() {
        setInterval(() => this.cleanup(), CLEANUP_INTERVAL)
    }

    async gotEncodedBuffer(encodedBuffer) {
        const context = this.context;
        const decode = new Promise(resolve => {
            context.decodeAudioData(encodedBuffer, resolve);
        });
        this.buffer = await decode;
        this.audioId = uuid();
        this.randomise();
    }
    
    setOverlap(overlap) {
        this.grainOverlap = overlap;
    }
    
    setLength(length) {
        this.grainLength = length;
    }
    
    randomise() {
        if (!this.buffer) return;
        this.grainPosition = Math.random();
        this.updateStartPoints();
    }
    
    updateStartPoints() {
        this.grainStartPoints = [this.grainPosition * (this.buffer.duration-this.grainLength)];
    }
    
    setPosition(fraction) {
        this.grainPosition = fraction;
        this.updateStartPoints();
    }
    
    midiMessage(message) {
        let [messageType, , velocity] = message.data;
        if (messageType === NOTE_ON && velocity !== 0) {
            this.noteOn();
        }
    }
    
    noteOn() {
        if (!this.buffer) return;
        const output = this.context.createGain();
        output.gain.setValueAtTime(0, 0);
        output.connect(this.parentRack.startOfFxChain);
        const startTime = this.context.currentTime;
        for (let i=0; i<this.numGrains; i++) {
            const node = this.context.createBufferSource();
            const nodeGain = this.context.createGain();
            node.buffer = this.buffer;
            node.connect(nodeGain);
            nodeGain.connect(output);
            const nodeStartTime = startTime + i * this.grainSpacing;
            
            // Attack
            nodeGain.gain.setValueAtTime(0, nodeStartTime);
            const attackTimeConstant = this.targetConstant * this.grainAttack;
            nodeGain.gain.setTargetAtTime(1, nodeStartTime+0.01, attackTimeConstant);
            
            // Release
            const nodeEndTime = nodeStartTime + this.grainLength;
            nodeGain.gain.setTargetAtTime(0, nodeEndTime-this.grainRelease, this.targetConstant * this.grainRelease);
            const nodePositionFraction = bounded(
                this.grainPosition * (0.5 + gaussianRand(this.tightness)), 
                0, 1
            );
            const nodePosition = nodePositionFraction * this.buffer.duration;
            console.log({nodePosition, grainPosition: this.grainPosition * this.buffer.duration});
            node.start(nodeStartTime, nodePosition, this.buffer.duration);
            
            // Cleanup
            this.nodes.push({ nodeGain, node, nodeEndTime });
        }
        
        const attackTimeConstant = this.targetConstant * this.attack;
        output.gain.setTargetAtTime(1, startTime+0.01, attackTimeConstant);
        
        const releaseTimeConstant = this.targetConstant * this.release;
        const releaseStartTime = startTime + this.maxLength - this.release;
        output.gain.setTargetAtTime(0, releaseStartTime, releaseTimeConstant);
    }

    play() {}
    
    pause() {}

    routeTo(destination) {
        if (destination.input) {
            destination = destination.input;
        }
        this.destination = destination;
        if (this.node) {
            this.node.disconnect();
            this.node.connect(destination);
        }
    }
}