const EffectType = Object.freeze({
    Pan: Symbol("Pan"),
    Filter: Symbol("Filter"),
    Gain: Symbol("Gain"),
    Compressor: Symbol("Compressor"),
    Reverb: Symbol("Reverb"),
    Echo: Symbol("Echo"),
    Distortion: Symbol("Distortion"),
    BitCrusher: Symbol("BitCrusher"),
    HighPassFilter: Symbol("HighPassFilter")
});


const EffectTypes = [
    {type: EffectType.Pan, text: "Pan"},
    {type: EffectType.Filter, text: "Low Pass"},
    {type: EffectType.HighPassFilter, text: "High Pass"},
    {type: EffectType.Gain, text: "Volume"},
    {type: EffectType.Compressor, text: "Compressor"},
    {type: EffectType.Reverb, text: "Reverb"},
    {type: EffectType.Echo, text: "Echo"},
    {type: EffectType.Distortion, text: "Distortion"},
    {type: EffectType.BitCrusher, text: "Bit Crusher"}
];


export { EffectTypes, EffectType };
