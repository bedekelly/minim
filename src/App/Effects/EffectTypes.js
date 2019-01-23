const EffectType = Object.freeze({
    Pan: Symbol("Pan"),
    Filter: Symbol("Filter"),
    Gain: Symbol("Gain"),
    Compressor: Symbol("Compressor")
});


const EffectTypes = [
    {type: EffectType.Pan, text: "Add Pan", image: "https://lorempixel.com/200/120"},
    {type: EffectType.Filter, text: "Add Filter", image: "https://lorempixel.com/200/120"},
    {type: EffectType.Gain, text: "Add Gain", image: "https://lorempixel.com/200/120"},
    {type: EffectType.Compressor, text: "Add Comp", image: "https://lorempixel.com/200/120"}
];


export { EffectTypes, EffectType };
