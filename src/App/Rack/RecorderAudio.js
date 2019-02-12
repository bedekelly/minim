import SequencerAudio from './SequencerAudio';
import uuid from 'uuid4';

const NOTE_OFF = 128;
const NOTE_ON = 144;


export default class RecorderAudio {
    constructor(context) {
        this.context = context;
        this.sequencer = new SequencerAudio(context)
        this.recording = false;
        this.playing = false;
        this.noteIDs = {};
    }
    
    toggleRecording() {
        this.recording = !this.recording;
    }
    
    set beatsPerMeasure(value) {
        this.sequencer.timeSignature = value;
    }
    
    set bpm(value) {
        this.sequencer.bpm = value;
    }
    
    get beatsPerMeasure() {
        return this.sequencer.timeSignature;
    }
    
    get bpm() {
        return this.sequencer.bpm;
    }
    
    noteId(data) {
        if (data[0] === NOTE_ON) {
            const id = this.noteIDs[data[1]] = uuid();
            return id;
        } else if (data[0] === NOTE_OFF) {
            return this.noteIDs[data[1]];
        }
    }
    
    midiMessage({ data }) {
        if (this.recording && this.playing) {
            const id = this.noteId(data);
            this.sequencer.addRepeatingNoteNow(data, id);
        }
        if (this.source) {
            this.source.midiMessage({data});
        }
    }
    
    sendNotesTo(source) {
        this.source = source;
        this.sequencer.sendNotesTo(source);
    }
    
    togglePlaying() {
        if (this.playing) {
            this.sequencer.pause();
            this.playing = false;
        } else {
            this.sequencer.play();
            this.playing = true;
        }
    }
    
    play() {
        if (this.playing) return;
        this.sequencer.play();
        this.playing = true;
    }
    
    pause() {
        if (!this.playing) return;
        this.sequencer.pause();
        this.playing = false;
    }
    
    stop() {
        this.sequencer.stop();
        this.playing = false;
    }
}