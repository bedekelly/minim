const EffectType = Object.freeze({
    Pan: Symbol("Pan"),
    Filter: Symbol("Filter"),
    Gain: Symbol("Gain")
});


const EffectTypes = [
    {type: EffectType.Pan, text: "Add Pan"},
    {type:EffectType.Filter, text: "Add Filter"},
    {type: EffectType.Gain, text: "Add Gain"}
];


export { EffectTypes, EffectType };
