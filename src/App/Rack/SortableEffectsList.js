import React from 'react';

import {
  SortableContainer,
  SortableElement,
} from 'react-sortable-hoc';

import { Effect } from '../Components/Effects'


const SortableEffect = SortableElement(Effect);

const SortableEffectsList = graph => SortableContainer(({effects}) => 
    <div className="sortable-container"> {
        effects.map(({effectType, id}, index) => 
            <SortableEffect
                effectType={effectType}
                id={id}
                key={id}
                graph={graph}
                index={index}>
            </SortableEffect>
        )
    }
    </div>
);

export default SortableEffectsList;