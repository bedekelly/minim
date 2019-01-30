const NOTE_OFF = 128;
const NOTE_ON = 144;

const POLYPHONY = 6;
const NUMBER_OSCILLATORS = 2;
const FULL_VOLUME = 1/(POLYPHONY*NUMBER_OSCILLATORS);


function midiToPitch(midi) {
    return Math.pow(2, (midi - 69) / 12) * 440;
}


export default class SynthAudio {

    constructor(parentAudio) {
        this.context = parentAudio.appAudio.context;
        this.oscOneGain = this.context.createGain();
        this.oscOneGain.gain.setValueAtTime(FULL_VOLUME, 0);
        this.oscTwoGain = this.context.createGain();
        this.oscTwoGain.gain.setValueAtTime(FULL_VOLUME, 0)
        this.mainMix = this.context.createGain();
        this.oscOneGain.connect(this.mainMix);
        this.oscTwoGain.connect(this.mainMix);
        this.notes = {};

        this.osc1 = {
            waveform: "sine"
        };

        this.osc2 = {
            waveform: ""
        };

        this.ampEnvelope = {
            attack: 0,
            decay: 0,
            sustain: 1,
            release: 0
        }
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

    noteOnAtTime(note, time) {
        
        const pitchOne = midiToPitch(note);
        const pitchTwo = midiToPitch(note + 12);
        console.log({ pitchOne, pitchTwo });
        
        // Create two oscillators.
        const oscOne = this.context.createOscillator();
        oscOne.type = this.osc1.waveform;
        const oscTwo = this.context.createOscillator();
        oscTwo.type = this.osc2.waveform;
        
        // Create a gain for each oscillator.
        const oscOneGain = this.context.createGain();
        oscOneGain.gain.setValueAtTime(0.5, time);
        const oscTwoGain = this.context.createGain();
        const o2gainValue = oscTwo.type !== "" ? 0.5 : 0;
        oscTwoGain.gain.setValueAtTime(o2gainValue, time);
        
        // Create a gain to follow the amp envelope.
        const oscAmpGain = this.context.createGain();
        oscAmpGain.gain.setValueAtTime(0, time);
        
        // Connect the graph.
        oscOne.connect(oscOneGain);
        oscTwo.connect(oscTwoGain);
        oscOneGain.connect(oscAmpGain);
        oscTwoGain.connect(oscAmpGain);
        oscAmpGain.connect(this.mainMix);

        for (let [osc, gain, pitch] of [[oscOne, oscOneGain, pitchOne], [oscTwo, oscTwoGain, pitchTwo]]) {
            osc.frequency.setValueAtTime(pitch, time);
            osc.connect(gain);
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
        for (let osc of Object.values(this.notes)) {
            osc.disconnect();
            osc.connect(output);
        }
        this._output = output;
        this.output = this.context.createGain();
        this.mainMix.connect(this.output);
        this.output.connect(this._output);
    }
}