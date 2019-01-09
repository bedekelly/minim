import React from 'react';

import Pan from './Pan';
import { EffectType } from '../../utils/EffectTypes';


function Effect(props) {
    switch (props.effectType) {
        case EffectType.Pan: {
            return <Pan {...props}></Pan>
        }
        default: return null;
    }
}


export default Effect;