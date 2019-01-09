const SourceType = Object.freeze({
    TapeLooper: Symbol("TapeLooper"),
});

const SourceTypes = [
    { 
        type: SourceType.TapeLooper,
        text: "Add Tape Looper"
    }
]


export { SourceType, SourceTypes };