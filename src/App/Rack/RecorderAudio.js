import SequencerAudio from './SequencerAudio';


export default class RecorderAudio {
    constructor(context) {
        this.context = context;
        this.sequencer = new SequencerAudio(context)
        this.recording = false;
        this.playing = false;
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
    
    midiMessage({ data }) {
        if (this.recording && this.playing) {
            this.sequencer.addRepeatingNoteNow(data);
        }
        else if (this.source) {
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