import React from 'react';

import {
  SortableContainer,
  SortableElement,
} from 'react-sortable-hoc';

import { Effect } from '../Effects'


const SortableEffect = SortableElement(Effect);

const SortableEffectsList = graph => SortableContainer(({effects, removeEffect}) => 
    <div className="sortable-container"> {
        effects.map(({effectType, id}, index) => 
            <SortableEffect
                effectType={effectType}
                id={id}
                removeSelf={() => removeEffect(id)}
                key={id}
                graph={graph}
                index={index}>
            </SortableEffect>
        )
    }
    </div>
);

export default SortableEffectsList;