const NOTE_OFF = 128;
const NOTE_ON = 144;

const POLYPHONY = 6;
const NUMBER_OSCILLATORS = 2;
const FULL_VOLUME = 1/(POLYPHONY*NUMBER_OSCILLATORS);

const PITCH_LFO_AMP = 50;
const AMP_LFO_AMP = 0.5;


function midiToPitch(midi) {
    return Math.pow(2, (midi - 69) / 12) * 440;
}


export default class SynthAudio {

    setupLFOs() {
        this.lfoNode = this.context.createOscillator();
        this.lfoNode.frequency.setValueAtTime(this.lfo.rate, 0);
        this.pitchLfo = this.context.createGain();
        this.pitchLfo.gain.setValueAtTime(PITCH_LFO_AMP, 0);
        this.ampLfo = this.context.createGain();
        this.ampLfo.gain.setValueAtTime(AMP_LFO_AMP, 0);
        this.filterLfo = this.context.createGain();
        this.filterLfo.gain.setValueAtTime(this.filter.freq, 0)
        this.lfoNode.connect(this.pitchLfo);
        this.lfoNode.connect(this.ampLfo);
        this.lfoNode.connect(this.filterLfo);
        this.lfoNode.start();
    }

    constructor(parentAudio) {
        this.filter = {
            freq: 12000,
            res: 0,
            type: "lowpass"
        }

        this.osc1 = {
            waveform: "sine",
            octave: 0,
            semi: 0,
            tune: 0
        };

        this.osc2 = {
            waveform: "",
            octave: 0,
            semi: 0,
            tune: 0
        };

        this.ampEnvelope = {
            attack: 0,
            decay: 0,
            sustain: 1,
            release: 0.01
        };
        
        this.filterEnvelope = {
            attack: 0,
            decay: 0,
            sustain: 1,
            release: 0.01
        }
        
        this.lfo = {
            rate: 0,
            destination: ""
        };
        
        this.context = parentAudio.appAudio.context;
        this.mainMix = this.context.createGain();
        this.notes = {};
        this.setupLFOs();
    }

    set ampAttack(value) {
        this.ampEnvelope.attack = value;
    }
    
    set ampDecay(value) {
        this.ampEnvelope.decay = value;
    }
    
    set ampSustain(value) {
        this.ampEnvelope.sustain = value;
    }
    
    set ampRelease(value) {
        this.ampEnvelope.release = value;
    }
    
    set lfoRate(value) {
        this.lfo.rate = value;
        this.lfoNode.frequency.setValueAtTime(value, 0);
    }
    
    connectFilterLFO() {
        for (let { filter } of Object.values(this.notes).flat()) {
            this.filterLfo.connect(filter);
        }
    }
    
    connectPitchLFO() {
        for (let { one, two } of Object.values(this.notes).flat()) {
            this.pitchLfo.connect(one.detune);
            this.pitchLfo.connect(two.detune);
        }
    }
    
    set lfoDestination(value) {
        this.lfo.destination = value;
        
        switch (value) {
            case "amplitude": {
                this.pitchLfo.disconnect();
                this.filterLfo.disconnect();
                this.ampLfo.connect(this.mainMix.gain);
                break;
            }
            
            case "pitch": {
                this.ampLfo.disconnect();
                this.filterLfo.disconnect();
                this.connectPitchLFO();
                break;
            }
            
            case "filter":
            default: {
                this.pitchLfo.disconnect();
                this.ampLfo.disconnect();
                this.connectFilterLFO();
            }
        }
    }
    
    set filterFreq(value) {
        this.filter.freq = value;
        for (let { filter } of Object.values(this.notes).flat()) {
            filter.frequency.cancelScheduledValues(0);
            filter.frequency.setValueAtTime(value, 0);
        }
        this.filterLfo.gain.setValueAtTime(this.filter.freq, 0)
    }
    
    set filterRes(value) {
        this.filter.res = value;
        for (let { filter } of Object.values(this.notes).flat()) {
            filter.frequency.cancelScheduledValues(0);
            filter.Q.setValueAtTime(value, 0);
        }
    }
    
    set filterType(value) {
        this.filter.type = value;
        for ( let { filter } of Object.values(this.notes)) {
            filter.type = this.filter.type;
        }
    }

    noteOnAtTime(pitch, time, id) {
        // console.log("Current time: ", this.context.currentTime);
        // console.log(`noteOnAtTime(${pitch}, ${time ? time : this.context.currentTime})`);
        const oscOneNote = pitch + this.osc1.octave * 12 + this.osc1.semi + this.osc1.tune/100;
        const oscTwoNote = pitch + this.osc2.octave * 12 + this.osc2.semi + this.osc2.tune/100;
        const pitchOne = midiToPitch(oscOneNote);
        const pitchTwo = midiToPitch(oscTwoNote);
        
        // Create two oscillators.
        const oscOne = this.context.createOscillator();
        oscOne.type = this.osc1.waveform;
        const oscTwo = this.context.createOscillator();
        oscTwo.type = this.osc2.waveform;

        // If LFO is controlling pitch, link it up.
        if (this.lfo.destination === "pitch") {
            this.pitchLfo.connect(oscOne.detune);
            this.pitchLfo.connect(oscTwo.detune);
        }

        // Create a gain for each oscillator.
        const oscOneGain = this.context.createGain();
        oscOneGain.gain.setValueAtTime(0.5, time);
        const oscTwoGain = this.context.createGain();
        oscTwoGain.gain.setValueAtTime(0.5, time);

        // Create the filter.
        const filter = this.context.createBiquadFilter();
        filter.frequency.setValueAtTime(this.filter.freq, time);
        filter.Q.setValueAtTime(this.filter.res, time);
        filter.gain.setValueAtTime(1, time);
        filter.type = this.filter.type;
        
        if (this.lfo.destination === "filter") {
            this.filterLfo.connect(filter.detune);
        }

        // Create a gain to follow the amp envelope.
        const oscAmpGain = this.context.createGain();
        oscAmpGain.gain.setValueAtTime(0, time);
        
        // Connect the graph.
        oscOne.connect(oscOneGain);
        if (this.osc2.waveform !== "") oscTwo.connect(oscTwoGain);
        oscOneGain.connect(filter);
        oscTwoGain.connect(filter);
        filter.connect(oscAmpGain);
        oscAmpGain.connect(this.mainMix);

        for (let [osc, pitch] of [[oscOne, pitchOne], [oscTwo, pitchTwo]]) {
            osc.frequency.setValueAtTime(pitch, time);
            osc.start(time);
            
            // Apply our filter envelope
            const freq = filter.frequency;
            freq.setValueAtTime(0, time);
            freq.setTargetAtTime(this.filter.freq, time, this.filterEnvelope.attack / 3);
            let filterSustain = this.filter.freq * this.filterEnvelope.sustain;
            const startTime = time < this.context.currentTime ? this.context.currentTime : time;
            const filterDecayTime = startTime + this.filterEnvelope.attack;
            freq.setTargetAtTime(filterSustain, filterDecayTime, this.filterEnvelope.decay / 3);
            
            // Apply our amp envelope:
            const ampGain = oscAmpGain.gain;
            ampGain.setValueAtTime(0, time);
            ampGain.setTargetAtTime(FULL_VOLUME, time, this.ampEnvelope.attack / 3);
            // Assumption: ampEnvelope.sustain is between 0 and 1.
            let ampSustain = this.ampEnvelope.sustain * FULL_VOLUME;
            const ampDecayTime = startTime + this.ampEnvelope.attack;
            ampGain.setTargetAtTime(ampSustain, ampDecayTime, this.ampEnvelope.decay / 3);
        }
        if (this.notes[pitch] === undefined) {
            this.notes[pitch] = [];
        }
        this.notes[pitch].push({ id, one: oscOne, two: oscTwo, oneGain: oscOneGain, twoGain: oscTwoGain, amp: oscAmpGain, filter, noteOffTriggered: false });
    }

    noteOn(note) {
        return this.noteOnAtTime(note, 0);
    }
    
    applyNoteOffEnvelope(note, time) {
        const { one, two, amp, filter } = note;
        const ampRelease = this.ampEnvelope.release;
        const filterRelease = this.filterEnvelope.release;
        let startTime = time < this.context.currentTime ? this.context.currentTime : time;
        amp.gain.cancelScheduledValues(startTime);
        amp.gain.setTargetAtTime(0, startTime, ampRelease / 5);
        filter.frequency.cancelScheduledValues(startTime);
        filter.frequency.setTargetAtTime(0, startTime, filterRelease / 5)
        one.stop(startTime + this.ampEnvelope.release);
        two.stop(startTime + this.ampEnvelope.release);
    }
    
    cleanupNote({ one, two, amp, filter, oneGain, twoGain }) {
        amp.disconnect();
        one.disconnect();
        two.disconnect();
        oneGain.disconnect();
        twoGain.disconnect();
        filter.disconnect();
    }
    
    cleanupNoteIfAlreadyPlayed(note, time) {
        if (time <= this.context.currentTime) {
            setTimeout(() => this.cleanupNote(note), this.ampEnvelope.release * 1000);
        }
    }
    
    noteOffAtTime(pitch, time) {
        // console.log(`noteOffAtTime(${pitch}, ${time ? time : this.context.currentTime})`);
        
        // Apply noteOff messages to every non-cleaned-up note of the given pitch.
        let notes = this.notes[pitch];
        
        for (let note of notes) {
            if (note.noteOffEnvelopeAppliedTime <= time ) continue;
            this.applyNoteOffEnvelope(note, time);
            this.cleanupNoteIfAlreadyPlayed(note, time);
            note.noteOffEnvelopeAppliedTime = time;
        }

    }
    
    noteOff(note) {
        this.noteOffAtTime(note, 0);
    }

    midiMessage(message, time, id) {
        time = time ? time : 0;
        const { data: [messageType, note, velocity] } = message;
        console.log(messageType);
        if (messageType === NOTE_OFF || velocity === 0) {
            this.noteOffAtTime(note, time, id);
        } else if (messageType === NOTE_ON) {
            this.noteOnAtTime(note, time, id);
        } 
    }
    
    scheduleNotes(notes) {
        for (let { data, time, id } of notes) {
            this.midiMessage({data}, time, id);
        }
    }
    
    cancelAllNotes() {
        console.log("Cancelling all notes");
        for (let pitch of Object.keys(this.notes)) {
            for (let note of this.notes[pitch]) {
                this.cleanupNote(note);
            }
        }
        this.notes = {};
    }

    play() {
        console.log("SynthAudio got play message: ignoring.");
    }

    pause() {
        console.log("SynthAudio got pause message: ignoring.");
    }

    routeTo(destination) {
        if (destination.input) {
            destination = destination.input;
        }
        this._output = destination;
        if (this.output) this.output.disconnect();
        this.output = this.context.createGain();
        this.mainMix.connect(this.output);
        this.output.connect(this._output);
    }
}