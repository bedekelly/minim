import MetronomeAudio from './MetronomeAudio';


export default class RecorderAudio {
    constructor(appAudio) {
        this.appAudio = appAudio;
        this.context = appAudio.context;

        this.bpm = 60;
        this.beatsPerMeasure = 4;
        this.metronome = new MetronomeAudio(appAudio, 60, 4);

        this.playing = false;
        this.recording = false;
        this.metronomeAudible = false;
    }

    toggleRecording() {
        this.recording = !this.recording;
    }

    toggleMetronome() {
        this.metronomeAudible = !this.metronomeAudible;
        this.metronome.setAudible(this.metronomeAudible);
    }

    play() {
        this.playing = true;
        console.log("Recorder play")
        this.metronome.play();
    }

    pause() {
        this.playing = false;
        this.metronome.pause();
    }

    stop() {
        this.playing = false;
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