import MetronomeAudio from './MetronomeAudio';


export default class RecorderAudio {
    constructor(appAudio) {
        this.appAudio = appAudio;
        this.context = appAudio.context;
        console.log(appAudio, appAudio.context);

        this._bpm = 60;
        this._beatsPerMeasure = 4;
        this.absoluteStartTime = 0;
        this.relativeStartTime = 0;
        this.metronome = new MetronomeAudio(this.context, 60, 4);

        this.playing = false;
        this.recording = false;
        this.scheduled = new Set();
        this.metronomeAudible = false;
    }

    set bpm(value) {
        this._bpm = value;
        this.metronome.bpm = value;
    }
    
    get bpm() {
        return this._bpm;
    }
    
    set beatsPerMeasure(value) {
        this._beatsPerMeasure = value;
        this.metronome.beatsPerMeasure = value;
    }
    
    get beatsPerMeasure() {
        return this._beatsPerMeasure;
    }
    
    get schedulerInterval() {
        return 1000 * (this.beatDuration / 3);
    }
    
    get beatDuration() {
        return 60 / this.bpm;
    }
    
    get barDuration() {
        return this.beatDuration * this.beatsPerMeasure;
    }
    
    get timeSinceStarted() {
        return this.context.currentTime - this.absoluteStartTime;
    }

    get currentRelativeTime() {
        return (this.relativeStartTime + this.timeSinceStarted) % this.barDuration;
    }
    
    toggleRecording() {
        this.recording = !this.recording;
    }
    
    toggleMetronome() {
        this.metronomeAudible = !this.metronomeAudible;
        this.metronome.audible = this.metronomeAudible;
    }
    
    scheduleNextBars() {
        console.log("Scheduling next bars");
        console.log(this.currentRelativeTime);
    }
    
    startScheduling() {
        this.scheduleNextBars();
        this.intervalID = setInterval(this.scheduleNextBars, this.schedulerInterval);
    }
    
    midiMessage(message) {
        console.log({ message, })
    }
    
    cancelAllNotes() {
        console.log("Cancel all notes on source");
        this.scheduled = new Set();
    }
    
    play() {
        if (this.playing) return;
        this.playing = true;
        this.absoluteStartTime = this.context.currentTime;
        this.relativeStartTime = this.currentRelativeTime;
        this.startScheduling();
        this.metronome.play();
    }
    
    pause() {
        this.playing = false;
        clearInterval(this.intervalID);
        this.cancelAllNotes();
        this.relativeStartTime = this.currentRelativeTime;
        this.metronome.pause();
    }
    
    stop() {
        this.pause();
        this.relativeStartTime = 0;
        this.metronome.stop();
    }
    
    togglePlaying() {
        if (this.playing) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    sendNotesTo(destination) {
        console.log("Send notes to", destination);
    }
}