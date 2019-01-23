import React from 'react';

import TapeLooper from './TapeLooper';
import GranularSynth from './GranularSynth';
import { SourceType } from './SourceTypes';


function Source(props) {
    switch (props.sourceType) {
        case SourceType.TapeLooper: {
            return <TapeLooper {...props}></TapeLooper>
        }
        case SourceType.GranularSynth: {
            return <GranularSynth {...props}></GranularSynth>
        }
        default: return null;
    }
}


export default Source;