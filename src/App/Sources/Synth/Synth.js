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
        return (
            <div className="synth">
              <Oscillator id={ this.props.id } audio={ this.audio } appAudio={ this.appAudio } num={ 1 } />
              <Oscillator id={ this.props.id } audio={ this.audio } appAudio={ this.appAudio } num={ 2 } />
              <FilterFrequency id={ this.props.id } audio={ this.audio } appAudio={ this.appAudio } />
              <FilterEnvelope id={ this.props.id } audio={ this.audio } appAudio={ this.appAudio } />
              <LFO id={ this.props.id } audio={ this.audio } appAudio={ this.appAudio } />
              <AmpEnvelope id={ this.props.id } audio={ this.audio } appAudio={ this.appAudio } />
            </div>              
        );
    }
}


export default Synth;