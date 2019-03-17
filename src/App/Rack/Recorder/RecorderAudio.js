import MetronomeAudio from './MetronomeAudio';

const NOTE_OFF = 128;
const NOTE_ON = 144;


export default class RecorderAudio {
    constructor(appAudio) {
        this.appAudio = appAudio;
        this.context = appAudio.context;
        console.log(appAudio, appAudio.context);

        this._bpm = 60;
        this._beatsPerMeasure = 4;
        this.barsLookahead = 3;
        this.absoluteStartTime = 0;
        this.relativeStartTime = 0;
        this.metronome = new MetronomeAudio(this.context, 60, 4);

        this.playing = false;
        this.recording = false;
        this.scheduled = new Set();
        this.notes = [];
        this.metronomeAudible = false;
        this.scheduleNextBars = this.scheduleNextBars.bind(this);
        
        this.noteIDs = {};
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
        return 1000 * (this.barDuration * (this.barsLookahead - 1));
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
    
    get startOfCurrentBar() {
        const currentAbsoluteTime = this.context.currentTime;
        const currentRelativeTime = this.currentRelativeTime;
        return currentAbsoluteTime - currentRelativeTime;
    }
    
    get barNumber() {
        const num = (this.startOfCurrentBar - this.absoluteStartTime) / this.barDuration;
        return Math.floor(num);
    }
    
    toggleRecording() {
        this.recording = !this.recording;
    }
    
    toggleMetronome() {
        this.metronomeAudible = !this.metronomeAudible;
        this.metronome.audible = this.metronomeAudible;
    }
    
    playingNotesAtTime(note, currentTime) {
        return this.noteIDs[note].filter(
            noteInfo => noteInfo.startTime < currentTime
        );
    }
    
    removeNoteID(note, idToRemove) {
        this.noteIDs[note] = this.noteIDs[note].filter(({id}) => id !== idToRemove);
    }
    
    /**
     * Send either a "note on" or "note off" message to the synth.
     * This is complicated by the fact that if we send a "note off",
     * we have to specify which particular note we want to turn off.
     */ 
    schedule({ note, onOff, time }) {
        if (!this.destination) return;

        if (onOff === NOTE_ON) {
            if (!this.noteIDs[note]) this.noteIDs[note] = [];
            this.noteIDs[note].push({
                id: this.destination.noteOnAtTime(note, time),
                startTime: time });
        } 
        
        else if (onOff === NOTE_OFF) {
            console.log("Playing notes: ", this.playingNotesAtTime(note, time));
            for (let playingNote of this.playingNotesAtTime(note, time)) {
                this.destination.noteIDOffAtTime(playingNote.id, time);
                this.removeNoteID(note, playingNote.id);
            }
        }
    }
    
    scheduleNextBars() {
        const thisBar = this.barNumber;
        
        // Schedule every bar up to our lookahead bar.
        for (let barOffset=0; barOffset<=this.barsLookahead; barOffset++) {
            const barNumber = thisBar + barOffset;
            const startOfBar = this.absoluteStartTime + barNumber * this.barDuration;
            
            // Schedule every note for this bar.
            for (let { onOff, note, offset } of this.notes) {
                const time = startOfBar + offset;
                console.log({ note, onOff, time});
                // Only schedule notes once, to prevent minor timing mistakes.
                const key = `${note},${onOff},${time}`;
                if (!this.scheduled.has(key)) {
                    this.schedule({ note, onOff, time });
                    this.scheduled.add(key);
                }
            }
        }
    }
    
    startScheduling() {
        this.scheduleNextBars();
        this.intervalID = setInterval(this.scheduleNextBars, this.schedulerInterval);
    }
    
    midiMessage(message) {
        if (!(this.playing && this.recording)) return;
        const [onOff, note] = message.data;
        
        this.notes.push({ onOff, note, offset: this.currentRelativeTime });
        this.scheduleNextBars();
    }
    
    cancelAllNotes() {
        if (this.destination && this.destination.cancelAllNotes) this.destination.cancelAllNotes();
        this.scheduled = new Set();
    }
    
    clearAll() {
        this.notes = [];
        
        // If it's not playing, we've already cancelled notes on the source.
        // So here we can avoid the duplicate call.
        if (this.playing) this.cancelAllNotes();
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
    
    rackMuteMetronome() {
        this.metronome.muteFromRack();
    }
    
    rackUnmuteMetronome() {
        this.metronome.unmuteFromRack();
    }
    
    togglePlaying() {
        if (this.playing) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    sendNotesTo(destination) {
        this.destination = destination;
    }
}