import React from 'react';

import {
  SortableContainer,
  SortableElement,
  SortableHandle
} from 'react-sortable-hoc';

import { Effect } from '../Effects'
import './EffectHandle.css';


const DragHandle = SortableHandle(() => <div className="effect-drag-handle"><span>☰</span></div>)
const SortableEffect = SortableElement(props => <Effect {...props} handle={<DragHandle />} />);

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