import uuid from 'uuid4';


const randomChoice = array => array[Math.floor(Math.random() * array.length)];


export default class RiceAudio {
    constructor(parentRack) {
        this.parentRack = parentRack;
        this.appAudio = parentRack.appAudio;
        this.context = this.appAudio.context;
        this.maxLength = 5;
        this.length = 0.3;
        this.overlap = 0.4;
        this.spacing = this.length * -this.overlap;
        this.numSlices = this.maxLength / (this.length+this.spacing);
        this.numUniqueSlices = 1;
        this.attack = 1;
        this.release = 3;
        this.targetConstant = 1/3;
        this.grainAttack = this.length/3;
        this.grainRelease = this.length/3;
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
    
    setSpace(space) {
        this.spacing = this.length * space;
    }
    
    setLength(length) {
        this.length = length;
    }
    
    randomise() {
        if (!this.buffer) return;
        this.grainStartPoints = [];
        for (let i=0; i<this.numUniqueSlices; i++) {
            this.grainStartPoints.push(Math.random() * (this.buffer.duration-this.length));
        }
    }
    
    noteOn() {
        if (!this.buffer) return;
        const output = this.context.createGain();
        output.gain.setValueAtTime(0, 0);
        output.connect(this.parentRack.startOfFxChain);
        const startTime = this.context.currentTime;
        for (let i=0; i<this.numSlices; i++) {
            const node = this.context.createBufferSource();
            const nodeGain = this.context.createGain();
            node.buffer = this.buffer;
            node.connect(nodeGain);
            nodeGain.connect(output);
            const nodeStartTime = startTime + i * (this.length + this.spacing);
            
            // Attack
            nodeGain.gain.setValueAtTime(0, nodeStartTime);
            const attackTimeConstant = this.targetConstant * this.grainAttack;
            nodeGain.gain.setTargetAtTime(1, nodeStartTime+0.01, attackTimeConstant);
            
            // Release
            nodeGain.gain.setTargetAtTime(0, nodeStartTime+this.length-this.grainRelease, this.targetConstant * this.grainRelease);
            node.start(nodeStartTime, randomChoice(this.grainStartPoints), this.length);
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
        console.log("Rice audio routed to ", destination);
    }
}