const SourceType = Object.freeze({
    TapeLooper: Symbol("TapeLooper"),
    GranularSynth: Symbol("GranularSynth")
});

const SourceTypes = [
    { 
        type: SourceType.TapeLooper,
        text: "Tape Looper", 
        image: "https://lorempixel.com/200/120"
    },
    {
        type: SourceType.GranularSynth,
        text: "Granular Synth",
        image: "https://lorempixel.com/200/120"
    }
]


export { SourceType, SourceTypes };