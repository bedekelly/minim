const EffectType = Object.freeze({
    Pan: Symbol("Pan"),
    Filter: Symbol("Filter")
});


const EffectTypes = [
    {type: EffectType.Pan, text: "Add Pan"},
    {type:EffectType.Filter, text: "Add Filter"}
];


export { EffectTypes, EffectType };
