import React from 'react';

import Knob from 'Components/Knob';


export default class LFO extends React.Component {
    
    constructor(props) {
        super(props);
        this.audio = props.audio;
        this.state = {
            lfoDestination: this.audio.lfo.destination,
            lfoRate: this.audio.lfo.rate
        }
    }
    
    changeLFODestination(lfoDestination) {
        if (lfoDestination === this.state.lfoDestination) {
            lfoDestination = null;
        }
        this.audio.lfoDestination = lfoDestination;
        this.setState({ lfoDestination });
    }
    
    setLFORate(lfoRate) {
        this.audio.lfoRate = lfoRate;
        this.setState({ lfoRate });
    }
    
    render() {

        const destName = this.props.id + "-destination";

        return <div className="comp lfo">
          <h2>LFO</h2>
          <div className="lfo-layout">
            <Knob min={ 0 } max={ 25 } value={ this.state.lfoRate }
                  default={ 0 }
                  label="Rate"
                  units="Hz"
                  onChange={ value => this.setLFORate(value) }
                  appAudio={ this.props.appAudio }
                  id={ this.props.id + "-lfo-rate" }
                  />
            <div className="label">Rate</div>
            <div className="destinations">
              <div className="destination">
                <label htmlFor={destName + "pitch"}>
                  <input type="radio" name={destName} value="pitch" id={ destName + "pitch" }
                      checked={ this.state.lfoDestination === "pitch" }
                      onClick={ e => this.changeLFODestination(e.target.value) }
                      onChange={ () => {} }
                      />
                  <div className="light" />
                  <span className="label">Pitch</span>
                </label>
              </div>
              <div className="destination">
                <label htmlFor={destName + "amplitude"}>
                  <input type="radio" name={destName} value="amplitude" id={ destName + "amplitude" }
                      checked={ this.state.lfoDestination === "amplitude" }
                      onClick={ e => this.changeLFODestination(e.target.value)  }
                      onChange={ () => {} }
                      />
                  <div className="light" />
                  <span className="label">Amp</span>
                </label>
              </div>
              <div className="destination">
                <label htmlFor={destName + "filter"}>
                  <input type="radio" name={destName} value="filter" id={destName + "filter"}
                      checked={ this.state.lfoDestination === "filter" }
                      onClick={ e => this.changeLFODestination(e.target.value) }
                      onChange={ () => {} }
                      />
                  <div className="light" />
                  <span className="label">Filter</span>
                </label>
              </div>
            </div>
          </div>
        </div>;
    }
}