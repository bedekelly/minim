import React from 'react';

import Knob from '../../Knob';


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
        this.audio.lfoDestination = lfoDestination;
        this.setState({ lfoDestination });
    }
    
    setLFORate(lfoRate) {
        this.audio.lfoRate = lfoRate;
        this.setState({ lfoRate });
    }
    
    render() {
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
                  ></Knob>
            <div className="label">Rate</div>
            <div className="destinations">
              <div className="destination">
                <label htmlFor="pitch">
                  <input type="radio" name="destination" value="pitch" id="pitch" 
                      checked={ this.state.lfoDestination === "pitch" }
                      onChange={ e => this.changeLFODestination(e.target.value) }
                      ></input>
                  <div className="light"></div>
                  <span className="label">Pitch</span>
                </label>
              </div>
              <div className="destination">
                <label htmlFor="amplitude">
                  <input type="radio" name="destination" value="amplitude" id="amplitude" 
                      checked={ this.state.lfoDestination === "amplitude" }
                      onChange={ e => this.changeLFODestination(e.target.value) }
                      ></input>
                  <div className="light"></div>
                  <span className="label">Amp</span>
                </label>
              </div>
              <div className="destination">
                <label htmlFor="filter">
                  <input type="radio" name="destination" value="filter" id="filter" 
                      checked={ this.state.lfoDestination === "filter" }
                      onChange={ e => this.changeLFODestination(e.target.value) }
                      ></input>
                  <div className="light"></div>
                  <span className="label">Filter</span>
                </label>
              </div>
            </div>
          </div>
        </div>;
    }
}