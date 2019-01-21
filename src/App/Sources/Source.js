import React from 'react';

import TapeLooper from './TapeLooper';
import Rice from './Rice';
import { SourceType } from './SourceTypes';


function Source(props) {
    switch (props.sourceType) {
        case SourceType.TapeLooper: {
            return <TapeLooper {...props}></TapeLooper>
        }
        case SourceType.Rice: {
            return <Rice {...props}></Rice>
        }
        default: return null;
    }
}


export default Source;