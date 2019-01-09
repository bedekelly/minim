import React from 'react';

import Pan from './Pan';
import Filter from './Filter';
import { EffectType } from '../../utils/EffectTypes';


function Effect(props) {
    switch (props.effectType) {
        case EffectType.Pan: {
            return <Pan key={props.id} {...props}></Pan>
        }
        case EffectType.Filter: {
            return <Filter key={props.id} {...props}></Filter>
        }
        default: return null;
    }
}


export default Effect;