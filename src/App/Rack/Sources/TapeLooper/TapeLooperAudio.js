import uuid from 'uuid';

import { SourceType } from '../SourceTypes';

const MS_SPEED_UP = 100;

class TapeLooperAudio {

    constructor(parentRack) {
        this.buffer = null;
        this.parentRack = parentRack;
        this.appAudio = parentRack.appAudio;
        this.paused = true;
        this.context = this.appAudio.context;
        this.absoluteStartTime = 0;
        this.relativeStartTime = 0;
        this.originalDuration = 0;
        this.playbackRate = 1;
        this.type = SourceType.TapeLooper;
        this.looping = true;
        this.realism = false;
        this._loopStart = 0;
        this._loopEnd = 0;
        this.node = null;
        this.audioId = null;
    }

    get playing() {
        return !this.paused;
    }

    midiMessage(message) {
        console.log("Tape looper ignoring MIDI message: ", message);
        console.log(message.data);
    }
    
    toggleLooping() {
        this.relativeStartTime = this.relativeCurrentTime;
        this.absoluteStartTime = this.context.currentTime;
        this.looping = !this.looping;
        
        if (!this.node) return;
        
        this.node.loop = this.looping;
        
        if (!this.looping) {
            // Setup on-ended callback to move play head to start again.
            this.node.onended = event => {
                this.stop();
            }
        } else {
            // Remove on-ended callback.
            this.node.onended = () => {};
        }
    }

    async gotEncodedBuffer(arrayBuffer) {
        await this.stop();
        const context = this.context;
        const prom = new Promise(resolve => {
            context.decodeAudioData(arrayBuffer, resolve);
        });
        this.relativeStartTime = 0;
        this.absoluteStartTime = context.currentTime;
        this.buffer = await prom;
        this.originalDuration = this.buffer.duration;
        this.loopStart = 0;
        this.loopEnd = this.buffer.duration;
        this.audioId = uuid();
    }

    async play() {
        // Don't spawn duplicate sounds if we're already playing.
        if (!this.paused) return;
        
        // Don't try and play a sound if we haven't loaded one.
        if (!this.buffer) return;
        
        // Create and setup a source node which reads from an audio buffer.
        // Note: this DOES need to happen every time we resume audio!
        this.paused = false;
        const bufferSourceNode = this.node = this.context.createBufferSource();
        bufferSourceNode.buffer = this.buffer;
        bufferSourceNode.loop = this.looping;
        bufferSourceNode.loopStart = this._loopStart;
        
        if (this._loopEnd !== undefined) 
            bufferSourceNode.loopEnd = this._loopEnd;
        else
            bufferSourceNode.loopEnd = this.buffer.duration / this.playbackRate;
        bufferSourceNode.connect(this.parentRack.startOfFxChain);
        bufferSourceNode.start(0, this.relativeStartTime);
        this.node = bufferSourceNode;

        // Store the current time so we can pause/resume later.
        this.absoluteStartTime = this.context.currentTime;

        if(this.realism) {
            // Start with a playback rate of 0 then speed up.
            bufferSourceNode.playbackRate.setValueAtTime(0, 0);
            this.speedBufferUpToPlaying()
        } else {
            bufferSourceNode.playbackRate.setValueAtTime(this.playbackRate, 0);
        }
        
        if (!this.looping) {
            // Setup on-ended callback to move play head to start again.
            this.node.onended = event => {
                this.stop();
            }
        }
    }

    set loopStart(value) {
        this.relativeStartTime = this.relativeCurrentTime;
        this.absoluteStartTime = this.context.currentTime;
        if (this.node) this.node.loopStart = value;
        this._loopStart = value;
        this.inLoop = this.checkInLoop();
    }

    get loopStart() {
        return this._loopStart;
    }

    get duration() {
        if (this.buffer) return this.buffer.duration;
        else return 0;
    }

    set loopEnd(value) {
        // If we're in the loop now, and the loop-end value is set to
        // a time before the current play-head, the source node will
        // warp back to the start. We reflect that change in any
        // request for the relative current time.
        const inLoopNow = this.looping && this.checkInLoop();
        const relativeCurrentTime = this.relativeCurrentTime;
        if (inLoopNow && relativeCurrentTime > value) {
            this.relativeStartTime = this._loopStart;
        } else {
            this.relativeStartTime = relativeCurrentTime;
        }

        // Set the absolute start time to now.
        this.absoluteStartTime = this.context.currentTime;

        // Set the audio node's loop end value.
        if (this.node) this.node.loopEnd = value;
        
        // Update our local variable to reflect loop end.
        this._loopEnd = value;
        
        // Update whether we're inside the loop now or not.
        this.inLoop = inLoopNow;
    }

    get loopEnd() {
        // Web Audio represents "no loop end" with a value of zero, so we need to change
        // this to the duration of the buffer for design purposes.
        return this._loopEnd;
    }

    updateOutput() {
        this.node.disconnect();
        this.node.connect(this.parentRack.startOfFxChain);
    }

    scrubToFraction(fraction) {
        this.skipToTime(fraction * this.originalDuration);
    }
    
    skipToTime(newTime) {
        this.inLoop = this.checkInLoop();
        if (newTime > this.loopEnd && this.looping) return;
        this.relativeStartTime = newTime;
        this.absoluteStartTime = this.context.currentTime;
        if (!this.paused) {
            this.disconnect();
            this.paused = true;
            this.play();
        }
    }

    skipToStartOfSong() {
        this.skipToTime(0);
    }
    
    skipToStartOfLoopOrSong() {
        if (this.relativeCurrentTime > this.loopStart) {
            this.skipToTime(this.loopStart)
        } else {
            this.skipToStartOfSong();
        }
    }
    
    skipToEndOfLoopOrSong() {
        if (this.relativeCurrentTime < this.loopEnd) {
            this.skipToTime(this.loopEnd)
        } else {
            this.stop()
        }
    }

    disconnect() {
        if (this.node) {
            this.node.disconnect();
            this.node = null;
        }
    }

    async stop() {
        await this.pause();
        this.inLoop = false;
        this.absoluteStartTime = this.context.currentTime;
        this.relativeStartTime = 0;
        if (this.stopGraphics) {
            this.stopGraphics()
        }
    }
    
    checkInLoop() {
        // Assume playback rate is constant for the last chunk.
        // This precludes using linearRampToValueAtTime.
        const absoluteCurrentTime = this.context.currentTime;
        const { loopStart, loopEnd, playbackRate, relativeStartTime, absoluteStartTime, duration } = this;
        const wallClockTimeElapsed = (absoluteCurrentTime - absoluteStartTime);
        const relativeTimeElapsed = wallClockTimeElapsed * playbackRate;
        const songPositionWithoutLoopMarkers = (relativeStartTime + relativeTimeElapsed) % duration;
        const afterLoopStart = loopStart < songPositionWithoutLoopMarkers;
        const beforeLoopEnd = songPositionWithoutLoopMarkers < loopEnd;
        return afterLoopStart && beforeLoopEnd;
    }
    
    get relativeCurrentTime() {
        if (this.paused) {
            return this.relativeStartTime;
        }
        
        // Assume playback rate is constant for the last chunk.
        // This precludes using linearRampToValueAtTime.
        const absoluteCurrentTime = this.context.currentTime;
        const { loopStart, loopEnd, playbackRate, relativeStartTime, absoluteStartTime, duration } = this;
        const wallClockTimeElapsed = (absoluteCurrentTime - absoluteStartTime);
        const relativeTimeElapsed = wallClockTimeElapsed * playbackRate;
        let songPositionWithoutLoopMarkers = (relativeStartTime + relativeTimeElapsed);
        if (this.looping) songPositionWithoutLoopMarkers %= duration;

        if (this.looping && this.inLoop) {
            // If so, calculate the time given that we've been in the loop for some time.
            return (relativeStartTime + relativeTimeElapsed - loopStart) % (loopEnd - loopStart) + loopStart;
        } else if (this.looping) {
            this.inLoop = this.checkInLoop();
        }
        
        return Math.min(songPositionWithoutLoopMarkers, duration);
    }

    async pause() {
        this.relativeStartTime = this.relativeCurrentTime;
        this.paused = true;
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
        this.absoluteStartTime = this.context.currentTime;
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
        if (this.node) {
            this.relativeStartTime = this.relativeCurrentTime;
            this.absoluteStartTime = this.context.currentTime;
            this.node.playbackRate.setValueAtTime(newRate, 0);
        }
    }
    
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


export default TapeLooperAudio;