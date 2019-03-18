import React from 'react';
import Knob from 'Components/Knob';


const filterTypes = {
    "LP": { next: "HP", audio: "lowpass", qLabel: "Res" },
    "HP": { next: "BP", audio: "highpass", qLabel: "Res" },
    "BP": { next: "NT", audio: "bandpass", qLabel: "Width" },
    "NT": { next: "AP", audio: "notch", qLabel: "Width" },
    "AP": { next: "LP", audio: "allpass", qLabel: "Sharp" }
};


export default class FilterFrequency extends React.Component {
    
    constructor(props) {
        super(props);
        this.audio = props.audio;
        this.state = {
            filterFreq: this.audio.filter.freq,
            filterRes: this.audio.filter.res,
            filterType: "LP"
        }
    }
    
    nextFilterType() {
        const currentType = this.state.filterType;
        const { next } = filterTypes[currentType];
        this.changeFilterType(next);
    }
    
    changeFilterType(nextFilter) {
        this.audio.filterType = filterTypes[nextFilter].audio;
        this.setState({ filterType: nextFilter });
    }

    changeFilterFreq(value) {
        this.audio.filterFreq = value;
        this.setState({ filterFreq: value });
    }
    
    changeFilterRes(value) {
        this.audio.filterRes = value;
        this.setState({ filterRes: value });
    }
    
    render() {
        return <div className="comp filter-freq">
          <h2>Filter <span className="filter-type" 
                           onClick={ () => this.nextFilterType() }
                           >{ this.state.filterType }</span></h2>
          <div className="knobs">
            <Knob min={1000} max={12000} value={this.state.filterFreq}
                  precision={ 2 }
                  onChange={value => this.changeFilterFreq(value)}
                  appAudio={ this.props.appAudio }
                  label="Frequency"
                  units="kHz"
                  scale={ 0.001 }
                  default={ 12000 }
                  id={ this.props.id + "-filter-freq" }
                  ></Knob>
            <div className="label freq">Freq</div>
            <Knob min={0} max={30} value={this.state.filterRes}
                  precision={ 1 }
                  appAudio={ this.props.appAudio }
                  default={ 0 }
                  label="Resonance"
                  units="dB"
                  id={ this.props.id + "-filter-res" }
                  onChange={value => this.changeFilterRes(value)}
                  ></Knob>
              <div className="label res">
                  { filterTypes[this.state.filterType].qLabel}
              </div>
          </div>
        </div>
    }
}