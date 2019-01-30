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

    setupFilter() {
        this.filterNode = this.context.createBiquadFilter();
        this.filterNode.frequency.setValueAtTime(this.filter.freq, 0);
        this.filterNode.Q.setValueAtTime(this.filter.res, 0);
        this.filterNode.gain.setValueAtTime(1, 0);
        this.filterNode.type = this.filter.type;
        this.filterNode.connect(this.mainMix);
    }
    
    setupLFOs() {
        this.lfoNode = this.context.createOscillator();
        this.lfoNode.frequency.setValueAtTime(this.lfo.rate, 0);
        this.pitchLfo = this.context.createGain();
        this.pitchLfo.gain.setValueAtTime(PITCH_LFO_AMP, 0);
        this.ampLfo = this.context.createGain();
        this.ampLfo.gain.setValueAtTime(AMP_LFO_AMP, 0);
        this.lfoNode.connect(this.pitchLfo);
        this.lfoNode.connect(this.ampLfo);
        this.lfoNode.start();
    }

    constructor(parentAudio) {
        this.filter = {
            freq: 850,
            res: 0,
            type: "LOWPASS"
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
            release: 0
        };
        
        this.lfo = {
            rate: 3,
            destination: ""
        };
        
        this.context = parentAudio.appAudio.context;
        this.mainMix = this.context.createGain();
        this.setupFilter();
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
    
    set lfoDestination(value) {
        this.lfo.destination = value;
        
        switch (value) {
            case "amplitude": {
                this.pitchLfo.disconnect();
                this.ampLfo.connect(this.mainMix.gain);
                break;
            }
            
            case "pitch": {
                this.ampLfo.disconnect();
                break;
            }
            
            default: {
                this.pitchLfo.disconnect();
                this.ampLfo.disconnect();
            }
        }
    }
    
    set filterFreq(value) {
        this.filter.freq = value;
        this.filterNode.frequency.setValueAtTime(value, 0);
    }
    
    set filterRes(value) {
        this.filter.res = value;
        this.filterNode.Q.setValueAtTime(value, 0);
    }

    noteOnAtTime(note, time) {
        const oscOneNote = note + this.osc1.octave * 12 + this.osc1.semi + this.osc1.tune/100;
        const oscTwoNote = note + this.osc2.octave * 12 + this.osc2.semi + this.osc2.tune/100;
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

        // Create a gain to follow the amp envelope.
        const oscAmpGain = this.context.createGain();
        oscAmpGain.gain.setValueAtTime(0, time);
        
        // Connect the graph.
        oscOne.connect(oscOneGain);
        if (this.osc2.waveform !== "") oscTwo.connect(oscTwoGain);
        oscOneGain.connect(oscAmpGain);
        oscTwoGain.connect(oscAmpGain);
        oscAmpGain.connect(this.filterNode);

        for (let [osc, pitch] of [[oscOne, pitchOne], [oscTwo, pitchTwo]]) {
            osc.frequency.setValueAtTime(pitch, time);
            osc.start(time);
            
            // Apply our amp envelope:
            const ampGain = oscAmpGain.gain;
            ampGain.setValueAtTime(0, time);
            ampGain.setTargetAtTime(FULL_VOLUME, time, this.ampEnvelope.attack / 3);
            // Assumption: ampEnvelope.sustain is between 0 and 1.
            let sustain = this.ampEnvelope.sustain * FULL_VOLUME;
            const startTime = time < this.context.currentTime ? this.context.currentTime : time;
            const decayTime = startTime + this.ampEnvelope.attack;

            ampGain.setTargetAtTime(sustain, decayTime, this.ampEnvelope.decay / 3);
        }
        
        this.notes[note] = { one: oscOne, two: oscTwo, oneGain: oscOneGain, twoGain: oscTwoGain, amp: oscAmpGain };
    }

    noteOn(note) {
        return this.noteOnAtTime(note, 0);
    }
    
    noteOffAtTime(note, time) {
        const { one, two, amp } = this.notes[note];
        const release = this.ampEnvelope.release;
        const startTime = time < this.context.currentTime ? this.context.currentTime : time;
        amp.gain.cancelScheduledValues(startTime);
        amp.gain.setTargetAtTime(0, startTime, release / 5);
        one.stop(startTime + this.ampEnvelope.release);
        two.stop(startTime + this.ampEnvelope.release);
    }
    
    noteOff(note) {
        this.noteOffAtTime(note, 0);
    }

    midiMessage(message) {
        const { data: [messageType, note] } = message;
        if (messageType === NOTE_OFF) {
            this.noteOff(note);
        } else if (messageType === NOTE_ON) {
            this.noteOn(note);
        }
    }

    play() {
        console.log("SynthAudio got play message: ignoring.");
    }

    pause() {
        console.log("SynthAudio got pause message: ignoring.");
    }

    routeTo(output) {
        console.log("Todo: Routing synth audio to ", output);
        this._output = output;
        if (this.output) this.output.disconnect();
        this.output = this.context.createGain();
        this.mainMix.connect(this.output);
        this.output.connect(this._output);
    }
}