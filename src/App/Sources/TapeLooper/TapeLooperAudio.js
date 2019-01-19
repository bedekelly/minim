import { SourceType } from '../SourceTypes';

const MS_SPEED_UP = 100;

class TapeLooperAudio {

    constructor(parentRack) {
        this.buffer = null;
        this.parentRack = parentRack;
        this.graph = parentRack.graph;
        this.context = this.graph.context;
        this.currentTime = 0;
        this.startTime = 0;
        this.playbackRate = 1;
        this.type = SourceType.TapeLooper;
        this.realism = false;
        this._loopStart = 0;
        this._loopEnd = undefined;
        this.node = null;
    }

    async gotEncodedBuffer(arrayBuffer) {
        await this.stop();
        const context = this.context;
        const prom = new Promise(resolve => {
            context.decodeAudioData(arrayBuffer, resolve);
        });
        this.currentTime = 0;
        this.buffer = await prom;
    }

    async play() {
        // Create and setup a source node which reads from an audio buffer.
        // Note: this DOES need to happen every time we resume audio!
        const bufferSourceNode = this.node = this.context.createBufferSource();
        bufferSourceNode.buffer = this.buffer;
        bufferSourceNode.loop = true;
        // console.log("Loop starting at ", this._loopStart);
        bufferSourceNode.loopStart = this._loopStart;
        if (this._loopEnd !== undefined) 
            bufferSourceNode.loopEnd = this._loopEnd;
        else
            bufferSourceNode.loopEnd = this.buffer.duration / this.playbackRate;
        bufferSourceNode.connect(this.parentRack.startOfFxChain);
        bufferSourceNode.start(0, this.currentTime);
        this.node = bufferSourceNode;

        // Store the current time so we can pause/resume later.
        this.startTime = this.context.currentTime;

        if(this.realism) {
            // Start with a playback rate of 0 then speed up.
            bufferSourceNode.playbackRate.setValueAtTime(0, 0);
            this.speedBufferUpToPlaying()
        }
    }

    set loopStart(value) {
        this._loopStart = value;
        if (this.node) this.node.loopStart = value;
    }
    
    get loopStart() {
        return this._loopStart;
    }
    
    get duration() {
        return this.buffer.duration;
    }
    
    set loopEnd(value) {
        this._loopEnd = value;
        this.node.loopEnd = value;
    }
    
    get loopEnd() {
        // Web Audio represents "no loop end" with a value of zero, so we need to change
        // this to the duration of the buffer for design purposes.
        return this.node && this.node.loopEnd ? this.node.loopEnd : this.buffer.duration;
    }

    updateOutput() {
        this.node.disconnect();
        this.node.connect(this.parentRack.startOfFxChain);
    }

    stop() {
        if (this.node) {
            this.node.disconnect();
            this.node = null;
        }
        this.startTime = 0;
    }
    
    get relativeCurrentTime() {
        
        if (this.node == null) {
            // We don't actually have an AudioBufferSourceNode, but
            // we can say the "current time" is the time we paused at.
            return this.currentTime;
        }
        
        // Otherwise, calculate the current time based on the audiocontext.
        const audioContextCurrentTime = this.context.currentTime;
        let relativeCurrentTime = this.currentTime;
        const regularSpeedTimeElapsed = (audioContextCurrentTime - this.startTime);
        relativeCurrentTime += (regularSpeedTimeElapsed * this.playbackRate);
        relativeCurrentTime %= this.duration;
        return relativeCurrentTime;
    }

    async pause() {
        if(!this.buffer || !this.node) {
            console.warn("Tried to pause without a buffer or bufferSourceNode");
            return;
        };
        
        if (this.realism) {
            await this.slowBufferToStop();
        }

        this.node.disconnect();
        
        // Calculate the time we should skip into the track next time we play it.
        // This is necessary if we want to use a new source node every time!
        this.currentTime = this.relativeCurrentTime;
        this.node = null;
    }
    
    speedBufferUpToPlaying() {
        return this._setPlaybackRate(this.playbackRate);
    }
    
    slowBufferToStop() {
        return this._setPlaybackRate(0);
    }
    
    _setPlaybackRate(newRate) {
        if (!this.node) return;
        this.node.playbackRate.linearRampToValueAtTime(
            newRate, this.context.currentTime+MS_SPEED_UP/1000);
        return new Promise((resolve, reject) => setTimeout(resolve, MS_SPEED_UP));
    }
    
    setPlaybackRate(newRate) {
        this.playbackRate = newRate;
        return this._setPlaybackRate(newRate);
    }
    
    routeTo(destination) {
        if (destination.node) {
            destination = destination.node;
        }
        this.destination = destination;
        if (this.node) {
            this.node.disconnect();
            this.node.connect(destination);
        }
    }
}


export default TapeLooperAudio;