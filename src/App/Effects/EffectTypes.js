const EffectType = Object.freeze({
    Pan: Symbol("Pan"),
    Filter: Symbol("Filter"),
    Gain: Symbol("Gain"),
    Compressor: Symbol("Compressor"),
    Reverb: Symbol("Reverb"),
    Echo: Symbol("Echo"),
    Distortion: Symbol("Distortion"),
    BitCrusher: Symbol("BitCrusher")
});


const EffectTypes = [
    {type: EffectType.Pan, text: "Pan", image: "https://lorempixel.com/200/120"},
    {type: EffectType.Filter, text: "Filter", image: "https://lorempixel.com/200/120"},
    {type: EffectType.Gain, text: "Volume", image: "https://lorempixel.com/200/120"},
    {type: EffectType.Compressor, text: "Compressor", image: "https://lorempixel.com/200/120"},
    {type: EffectType.Reverb, text: "Reverb", image: "https://lorempixel.com/200/120"},
    {type: EffectType.Echo, text: "Echo", image: "https://lorempixel.com/200/120"},
    {type: EffectType.Distortion, text: "Distortion", image: "https://lorempixel.com/200/120"},
    {type: EffectType.BitCrusher, text: "Bit Crusher", image: "https://lorempixel.com/200/120"}
];


export { EffectTypes, EffectType };
