import React from 'react';

import './Synth.css';

import Oscillator from './Oscillator';
import FilterFrequency from './FilterFrequency';
import FilterEnvelope from './FilterEnvelope';
import LFO from './LFO';
import AmpEnvelope from './AmpEnvelope';



class Synth extends React.Component {
    
    constructor(props) {
        super(props);
        this.audio = props.appAudio.sources[props.id];
        this.appAudio = props.appAudio;
    }

    render() {
        const components = [
            Oscillator, Oscillator, FilterEnvelope, 
            FilterFrequency, LFO, AmpEnvelope
        ]
        return (
            <div className="synth">
              { components.map((Component, i) =>
                  <Component key={ i } id={ this.props.id } audio={ this.audio } appAudio={ this.appAudio } num={ i }/>
              )}
            </div>
        );
    }
}


export default Synth;