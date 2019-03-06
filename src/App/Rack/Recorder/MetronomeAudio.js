import TICK_LOCATION from './Tick.wav';
import TOCK_LOCATION from './Tock.wav';


import { fetchAudioData } from './helpers';


export default class MetronomeAudio {
    constructor(audioContext, bpm, beatsPerMeasure) {
        this.context = audioContext;
        this.barsLookahead = 4;
        this._bpm = bpm;
        this._beatsPerMeasure = beatsPerMeasure;
        this.relativeStartTime = 0;
        this.absoluteStartTime = 0;
        this.scheduleNextBars = this.scheduleNextBars.bind(this);
        this.output = this.context.createGain();
        this.output.connect(this.context.destination);
        this.audible = false;
        this.scheduled = new Set();
        this.nodes = {};
        this.playing = false;
        this.loadSounds();
    }
    
    get schedulerInterval() {
        return 1000 * (this.barDuration * (this.barsLookahead - 1));
    }
    
    set audible(value) {
        const gain = value ? 1 : 0;
        this.output.gain.setValueAtTime(gain, 0);
    }
    
    set beatsPerMeasure(value) {
        if (this.playing) {
            this.pause();
            this._beatsPerMeasure = value;
            this.play();
        }
        else this._beatsPerMeasure = value;
    }
    
    get beatsPerMeasure() {
        return this._beatsPerMeasure;
    }
    
    set bpm(value) {
        if (this.playing) {
            this.pause();
            this._bpm = value;
            this.play();
        }
        else this._bpm = value;
    }
    
    get bpm() {
        return this._bpm;
    }

    setAudible(audible) {
        const newGain = audible ? 1 : 0;
        this.output.gain.setValueAtTime(newGain, 0);
    }

    async loadSounds() {
        let [tickBuffer, tockBuffer] = await Promise.all([
            fetchAudioData(TICK_LOCATION, this.context),
            fetchAudioData(TOCK_LOCATION, this.context)
        ]);
        this.buffers = { tick: tickBuffer, tock: tockBuffer };
    }

    get beatDuration() {
        return 60 / this.bpm;
    }

    get barDuration() {
        return this.beatsPerMeasure * this.beatDuration;
    }

    get timeSinceStarted() {
        return this.context.currentTime - this.absoluteStartTime;
    }

    get currentRelativeTime() {
        return (this.relativeStartTime + this.timeSinceStarted) % this.barDuration;
    }

    get startOfCurrentBar() {
        const currentAbsoluteTime = this.context.currentTime;
        const currentRelativeTime = this.currentRelativeTime;
        return currentAbsoluteTime - currentRelativeTime;
    }

    playSoundAtTime(sound, time) {
        if (!this.buffers) return;
        if (time < this.context.currentTime) return;

        const node = this.context.createBufferSource();
        node.buffer = this.buffers[sound];
        node.connect(this.output);
        node.start(time);
        const key = `${sound},${time}`;
        this.nodes[key] = node;

        node.onEnded = () => {
            node.disconnect();
            delete this.nodes[key]
        }
    }

    scheduleSoundAtBeat(sound, bar, beat) {
        const key = `${sound},${bar},${beat}`;
        if (this.scheduled.has(key)) return;

        const { absoluteStartTime, relativeStartTime, barDuration, beatDuration } = this;
        const time = (
            absoluteStartTime - relativeStartTime 
            + bar * barDuration 
            + beat * beatDuration
        );

        this.playSoundAtTime(sound, time);
        this.scheduled.add(key);
    }

    get barNumber() {
        const num = (this.startOfCurrentBar - this.absoluteStartTime) / this.barDuration;
        return Math.floor(num);
    }

    scheduleNextBars() {
        const thisBar = this.barNumber;
        for (let barOffset=0; barOffset<=this.barsLookahead; barOffset++) {
            const barNumber = thisBar + barOffset;
            for (let beat=0; beat<this.beatsPerMeasure; beat++) {
                const sound = beat === 0 ? "tick" : "tock";
                this.scheduleSoundAtBeat(sound, barNumber, beat)
            }
        }
    }

    startScheduling() {
        this.scheduleNextBars();
        this.intervalID = setInterval(this.scheduleNextBars, this.schedulerInterval);
    }

    play() {
        if (this.playing) return;
        this.playing = true;
        this.absoluteStartTime = this.context.currentTime;
        this.relativeStartTime = this.currentRelativeTime;
        this.startScheduling();
    }

    cancelAllNotes() {
        for (let [key, node] of Object.entries(this.nodes)) {
            node.disconnect();
            delete this.nodes[key];
        }
        this.scheduled = new Set();
    }

    pause() {
        this.playing = false;
        clearInterval(this.intervalID);
        this.cancelAllNotes();
        this.relativeStartTime = this.currentRelativeTime;
    }

    stop() {
        this.pause();
        this.relativeStartTime = 0;
    }
}