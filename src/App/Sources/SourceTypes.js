const SourceType = Object.freeze({
    TapeLooper: Symbol("TapeLooper"),
    Rice: Symbol("Rice")
});

const SourceTypes = [
    { 
        type: SourceType.TapeLooper,
        text: "Add Tape Looper"
    },
    {
        type: SourceType.Rice,
        text: "Add Rice"
    }
]


export { SourceType, SourceTypes };