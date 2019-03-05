import InitialData from './InitialData';


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

    constructor(parentAudio) {
        for (let [key, value] of Object.entries(InitialData)) {
            this[key] = value;
        }
        this.context = parentAudio.appAudio.context;
        this.mainMix = this.context.createGain();
        this.notes = {};
        this.setupLFOs();
    }
    
    setupLFOs() {
        // Create the actual low-frequency oscillator node.
        this.lfoNode = this.context.createOscillator();
        this.lfoNode.frequency.setValueAtTime(this.lfo.rate, 0);

        // Create a gain node which controls amplitude of pitch modulation.
        this.pitchLfo = this.context.createGain();
        this.pitchLfo.gain.setValueAtTime(PITCH_LFO_AMP, 0);

        // Control amplitude of amp modulation.
        this.ampLfo = this.context.createGain();
        this.ampLfo.gain.setValueAtTime(AMP_LFO_AMP, 0);

        // Control amplitude of filter modulation.
        this.filterLfo = this.context.createGain();
        this.filterLfo.gain.setValueAtTime(this.filter.freq, 0)

        // Connect LFO node to all three gain nodes.
        this.lfoNode.connect(this.pitchLfo);
        this.lfoNode.connect(this.ampLfo);
        this.lfoNode.connect(this.filterLfo);
        
        this.lfoNode.start();
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
    
    set osc1Tune(value) {
        this.osc1.tune = value;
        for (let { one, note } of Object.values(this.notes).flat()) {
            const frequency = midiToPitch(note + this.osc1.octave * 12 + this.osc1.semi + this.osc1.tune/100);
            one.frequency.setValueAtTime(frequency, 0);
        }
    }
    
    set osc1Semi(value) {
        this.osc1.semi = value;
        for (let { one, note } of Object.values(this.notes).flat()) {
            const frequency = midiToPitch(note + this.osc1.octave * 12 + this.osc1.semi + this.osc1.tune/100);
            one.frequency.setValueAtTime(frequency, 0);
        }
    }
    
    set osc1Oct(value) {
        this.osc1.octave = value;
        for (let { one, note } of Object.values(this.notes).flat()) {
            const frequency = midiToPitch(note + this.osc1.octave * 12 + this.osc1.semi + this.osc1.tune/100);
            one.frequency.setValueAtTime(frequency, 0);
        }
    }
    
    set osc2Tune(value) {
        this.osc2.tune = value;
        for (let { two, note } of Object.values(this.notes).flat()) {
            const frequency = midiToPitch(note + this.osc2.octave * 12 + this.osc2.semi + this.osc2.tune/100);
            two.frequency.setValueAtTime(frequency, 0);
        }
    }
    
    set osc2Semi(value) {
        this.osc2.semi = value;
        for (let { two, note } of Object.values(this.notes).flat()) {
            const frequency = midiToPitch(note + this.osc2.octave * 12 + this.osc2.semi + this.osc2.tune/100);
            two.frequency.setValueAtTime(frequency, 0);
        }
    }
    
    set osc2Oct(value) {
        this.osc2.octave = value;
        for (let { two, note } of Object.values(this.notes).flat()) {
            const frequency = midiToPitch(note + this.osc2.octave * 12 + this.osc2.semi + this.osc2.tune/100);
            two.frequency.setValueAtTime(frequency, 0);
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
    
    calculateNote(pitch, oscillator) {
        const osc = `osc${oscillator}`
        return pitch + this[osc].octave * 12 + this[osc].semi + this[osc].tune/100;
    }
    
    applyEnvelopeStart({param, envelope, startTime, maxValue, timeConstant=3}) {
        param.setValueAtTime(0, startTime);
        param.setTargetAtTime(maxValue, startTime, envelope.attack / timeConstant);
        let paramSustain = maxValue * envelope.sustain;
        startTime = startTime < this.context.currentTime ? this.context.currentTime : startTime;
        const paramDecayStart = startTime + envelope.attack;
        param.setTargetAtTime(paramSustain, paramDecayStart, envelope.decay / timeConstant);
    }
    
    playNoteAtTime(osc, pitch, time, gainNode, filterNode) {
        // Start the tone playing.
        osc.frequency.setValueAtTime(pitch, time);
        osc.start(time);
        
        // Apply our filter envelope
        this.applyEnvelopeStart({
            param: filterNode.frequency, 
            envelope: this.filterEnvelope, 
            startTime: time,
            maxValue: this.filter.freq
        });
        
        // Apply our amp envelope:
        this.applyEnvelopeStart({
            param: gainNode.gain,
            envelope: this.ampEnvelope,
            startTime: time,
            maxValue: FULL_VOLUME
        })
    }
    
    addNoteAtPitch(pitch, note) {
        if (this.notes[pitch] === undefined) this.notes[pitch] = [];
        this.notes[pitch].push(note);
    }
    
    noteOnAtTime(pitch, time, id) {
        // Calculate notes and pitches.
        const oscOneNote = this.calculateNote(pitch, 1);
        const oscTwoNote = this.calculateNote(pitch, 2);
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
            this.playNote(osc, pitch, time, oscAmpGain, filter);
        }

        this.addNoteAtPitch(pitch, { note: pitch, id, one: oscOne, two: oscTwo, oneGain: oscOneGain, twoGain: oscTwoGain, amp: oscAmpGain, filter, noteOffTriggered: false })
    }

    noteOn(note) {
        return this.noteOnAtTime(note, this.context.currentTime);
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
        // Apply noteOff messages to every non-cleaned-up note of the given pitch.
        let notes = this.notes[pitch];
        if (!notes) {
            console.warn("Couldn't find any playing notes to cancel; returning.");
            return;
        }
        
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