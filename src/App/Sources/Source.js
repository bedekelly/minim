import React from 'react';

import TapeLooper from './TapeLooper';
import { SourceType } from './SourceTypes';


function Source(props) {
    switch (props.sourceType) {
        case SourceType.TapeLooper: {
            return <TapeLooper {...props}></TapeLooper>
        }
        default: return null;
    }
}


export default Source;