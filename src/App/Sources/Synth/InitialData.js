export default {
    filter : {
        freq: 12000,
        res: 0,
        type: "lowpass"
    },

    osc1 : {
        waveform: "sine",
        octave: 0,
        semi: 0,
        tune: 0
    },

    osc2 : {
        waveform: "",
        octave: 0,
        semi: 0,
        tune: 0
    },

    ampEnvelope : {
        attack: 0,
        decay: 0,
        sustain: 1,
        release: 0.01
    },
    
    filterEnvelope : {
        attack: 0,
        decay: 0,
        sustain: 1,
        release: 0.01
    },
    
    lfo : {
        rate: 0,
        destination: ""
    }
}