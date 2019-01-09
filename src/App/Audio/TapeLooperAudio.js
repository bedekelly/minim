import { SourceType } from '../utils/SourceTypes';

const MS_SPEED_UP = 80;

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
        this.realism = true;
    }

    async gotEncodedBuffer(arrayBuffer) {
        await this.stop();
        const context = this.context;
        const prom = new Promise(resolve => {
            context.decodeAudioData(arrayBuffer, resolve);
        });
        this.buffer = await prom;
    }

    async play() {
        // Create and setup a source node which reads from an audio buffer.
        // Note: this DOES need to happen every time we resume audio!
        const bufferSourceNode = this.bufferSourceNode = this.context.createBufferSource();
        bufferSourceNode.buffer = this.buffer;
        bufferSourceNode.loop = true;
        bufferSourceNode.connect(this.parentRack.startOfFxChain);
        bufferSourceNode.start(0, this.currentTime);
        
        // Store the current time so we can pause/resume later.
        this.startTime = this.context.currentTime;
        
        if(this.realism) {
            // Start with a playback rate of 0 then speed up.
            bufferSourceNode.playbackRate.setValueAtTime(0, 0);
            this.speedBufferUpToPlaying()
        }
    }

    updateOutput() {
        this.bufferSourceNode.disconnect();
        this.bufferSourceNode.connect(this.parentRack.startOfFxChain);
    }

    async stop() {
        if (this.bufferSourceNode) {
            this.bufferSourceNode.disconnect();
            this.bufferSourceNode = null;
        }
        this.startTime = 0;
    }

    async pause() {
        if(!this.buffer || !this.bufferSourceNode) {
            console.warn("Tried to pause without a buffer or bufferSourceNode");
            return;
        };
        
        if (this.realism) {
            await this.slowBufferToStop();
        }

        this.bufferSourceNode.disconnect();
        
        // Calculate the time we should skip into the track next time we play it.
        // This is necessary if we want to use a new source node every time!
        const regularSpeedTimeElapsed = (this.context.currentTime - this.startTime);
        this.currentTime += (regularSpeedTimeElapsed / this.playbackRate);
        this.currentTime %= this.buffer.duration;
        this.bufferSourceNode = null;
    }
    
    async speedBufferUpToPlaying() {
        return await this._setPlaybackRate(this.playbackRate);
    }
    
    async slowBufferToStop() {
        return await this._setPlaybackRate(0);
    }
    
    async _setPlaybackRate(newRate) {
        this.bufferSourceNode.playbackRate.linearRampToValueAtTime(
            newRate, this.context.currentTime+MS_SPEED_UP/1000);
        return new Promise((resolve, reject) => setTimeout(resolve, MS_SPEED_UP));
    }
    
    async setPlaybackRate(newRate) {
        this.playbackRate = newRate;
        return this._setPlaybackRate(newRate);
    }
    
    routeTo(destination) {
        this.destination = destination;
        if (this.bufferSourceNode) {
            this.bufferSourceNode.disconnect();
            this.bufferSourceNode.connect(this.destination);
        }
    }
}


export default TapeLooperAudio;