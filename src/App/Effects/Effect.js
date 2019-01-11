import React from 'react';

import Pan from './Pan';
import Filter from './Filter';
import Gain from './Gain';
import { EffectType } from './EffectTypes';


// Map effect types onto the component that should be rendered.
const effectComponents = {
    [EffectType.Pan]: Pan,
    [EffectType.Filter]: Filter,
    [EffectType.Gain]: Gain
}


/**
 * Display an effect component for a given effect type.
 */
function Effect(props) {
    let defaultComponent = props => "no component found";
    const Component = effectComponents[props.effectType] || defaultComponent;
    return <div className="effect">
        <button className="remove" onClick={props.removeSelf}>X</button>
        <Component key={props.id} {...props}></Component>
    </div>
}

 
export default Effect;