import React from 'react';

import './Synth.css';


class Synth extends React.Component {
    
    constructor(props) {
        super(props);
        this.audio = props.appAudio.sources[props.id];
        this.state = {
            ampEnvelope: {
                attack: this.audio.ampEnvelope.attack,
                decay: this.audio.ampEnvelope.decay,
                sustain: this.audio.ampEnvelope.sustain,
                release: this.audio.ampEnvelope.release
            },
            osc1: {
                waveform: this.audio.osc1.waveform
            },
            osc2: {
                waveform: this.audio.osc2.waveform
            }
        }
    }
    
    setAmpAttack(value) {
        value = parseFloat(value);
        const { decay, sustain, release } = this.state.ampEnvelope;
        this.audio.ampAttack = value;
        this.setState({ ampEnvelope: { attack: value, decay, sustain, release }});
    }
    
    setAmpDecay(value) {
        value = parseFloat(value);
        const { attack, sustain, release } = this.state.ampEnvelope;
        this.audio.ampDecay = value;
        this.setState({ ampEnvelope: { attack, decay: value, sustain, release }});
    }
    
    setAmpSustain(value) {
        value = parseFloat(value);
        const { attack, decay, release } = this.state.ampEnvelope;
        this.audio.ampSustain = value;
        this.setState({ ampEnvelope: { attack, decay, sustain: value, release }});
    }
    
    setAmpRelease(value) {
        value = parseFloat(value);
        const { attack, decay, sustain } = this.state.ampEnvelope;
        this.audio.ampRelease = value;
        this.setState({ ampEnvelope: { attack, decay, sustain, release: value }});
    }
    
    changeOsc1Waveform(waveform) {
        this.audio.osc1.waveform = waveform;
        this.setState({ osc1: { waveform }})
    }
    
    changeOsc2Waveform(waveform) {
        this.audio.osc2.waveform = waveform;
        this.setState({ osc2: { waveform }})
    }
    
    render() {
        return (
            <div className="synth">
              <div className="comp osc one">
                <div className="knobs">
                  <div className="knob"></div>
                  <div className="label">Oct</div>
                  <div className="knob"></div>
                  <div className="label">Semi</div>
                  <div className="knob"></div>
                  <div className="label">Tune</div>
                </div>

                <div className="waveform">
                  <label htmlFor="sine">
                    <input type="radio" name="waveform" value="sine" id="sine" 
                        checked={ this.state.osc1.waveform === "sine" }
                        onChange={ e => this.changeOsc1Waveform(e.target.value) }
                        ></input>
                    <div className="light"></div>
                    <img src='https://s3-us-west-2.amazonaws.com/s.cdpn.io/1415658/sinepro.svg' alt=''></img>
                  </label>
                </div>

                <div className="waveform">
                  <label htmlFor="sawtooth">
                    <input type="radio" name="waveform" value="sawtooth" id="sawtooth"
                        checked={ this.state.osc1.waveform === "sawtooth" }
                        onChange={ e => this.changeOsc1Waveform(e.target.value) }
                        ></input>
                    <div className="light"></div>
                    <img src='https://s3-us-west-2.amazonaws.com/s.cdpn.io/1415658/sawtoothpro.svg' alt=''></img>
                  </label>
                </div>

                <div className="waveform">
                  <label htmlFor="triangle">
                    <input type="radio" name="waveform" value="triangle" id="triangle"
                        checked={ this.state.osc1.waveform === "triangle" }
                        onChange={ e => this.changeOsc1Waveform(e.target.value) }
                        ></input>
                    <div className="light"></div>
                    <img src='https://s3-us-west-2.amazonaws.com/s.cdpn.io/1415658/trianglepro.svg' alt=''></img>
                  </label>
                </div>

                <div className="waveform square">
                  <label htmlFor="square">
                    <input type="radio" name="waveform" value="square" id="square"
                        checked={ this.state.osc1.waveform === "square" }
                        onChange={ e => this.changeOsc1Waveform(e.target.value) }
                        ></input>
                    <div className="light"></div>
                    <img src='https://s3-us-west-2.amazonaws.com/s.cdpn.io/1415658/squarepro.svg' alt=''></img>
                  </label>
                </div>

              </div>
              <div className="comp osc two">
                <div className="knobs">
                  <div className="knob"></div>
                  <div className="label">Oct</div>
                  <div className="knob"></div>
                  <div className="label">Semi</div>
                  <div className="knob"></div>
                  <div className="label">Tune</div>
                </div>

                <div className="waveform">
                  <label htmlFor="sine2">
                    <input type="radio" name="waveform-two" value="sine" id="sine2"
                        checked={ this.state.osc2.waveform === "sine" }
                        onChange={ e => this.changeOsc2Waveform(e.target.value) }
                        ></input>
                    <div className="light"></div>
                    <img src='https://s3-us-west-2.amazonaws.com/s.cdpn.io/1415658/sinepro.svg' alt=''></img>
                  </label>
                </div>

                <div className="waveform">
                  <label htmlFor="sawtooth2">
                    <input type="radio" name="waveform-two" value="sawtooth" id="sawtooth2"
                        checked={ this.state.osc2.waveform === "sawtooth" }
                        onChange={ e => this.changeOsc2Waveform(e.target.value) }
                        ></input>
                    <div className="light"></div>
                    <img src='https://s3-us-west-2.amazonaws.com/s.cdpn.io/1415658/sawtoothpro.svg' alt=''></img>
                  </label>
                </div>

                <div className="waveform">
                  <label htmlFor="triangle2">
                    <input type="radio" name="waveform-two" value="triangle" id="triangle2"
                        checked={ this.state.osc2.waveform === "triangle" }
                        onChange={ e => this.changeOsc2Waveform(e.target.value) }
                        ></input>
                    <div className="light"></div>
                    <img src='https://s3-us-west-2.amazonaws.com/s.cdpn.io/1415658/trianglepro.svg' alt=''></img>
                  </label>
                </div>

                <div className="waveform square">
                  <label htmlFor="square2">
                    <input type="radio" name="waveform-two" value="square" id="square2"
                        checked={ this.state.osc2.waveform === "square" }
                        onChange={ e => this.changeOsc2Waveform(e.target.value) }
                        ></input>
                    <div className="light"></div>
                    <img src='https://s3-us-west-2.amazonaws.com/s.cdpn.io/1415658/squarepro.svg' alt=''></img>
                  </label>
                </div>

              </div>
              <div className="comp filter-freq">
                <h2>Filter <span className="filter-type">HP</span></h2>
                <div className="knobs">
                  <div className="knob freq"></div>
                  <div className="label freq">Freq</div>
                  <div className="knob res"></div>
                  <div className="label res">Res</div>
                </div>
              </div>
              <div className="comp envelope filter-envelope">
                <h2>Filter Env.</h2>
                <div className="slidecontainer">
                  <input type="range" min="1" max="100" className="slider" id="myRange"></input>
                </div>
                <div className="slidecontainer">
                  <input type="range" min="1" max="100" className="slider" id="myRange"></input>
                </div>
                <div className="slidecontainer">
                  <input type="range" min="1" max="100" className="slider" id="myRange"></input>
                </div>
                <div className="slidecontainer">
                  <input type="range" min="1" max="100" className="slider" id="myRange"></input>
                </div>
                <div className="label">A</div>
                <div className="label">D</div>
                <div className="label">S</div>
                <div className="label">R</div>
              </div>
              <div className="comp lfo">
                <h2>LFO</h2>
                <div className="lfo-layout">
                  <div className="knob"></div>
                  <div className="label">Rate</div>
                  <div className="destinations">
                    <div className="destination">
                      <label htmlFor="pitch">
                        <input type="radio" name="destination" value="pitch" id="pitch"></input>
                        <div className="light"></div>
                        <span className="label">Pitch</span>
                      </label>
                    </div>
                    <div className="destination">
                      <label htmlFor="amplitude">
                        <input type="radio" name="destination" value="amplitude" id="amplitude"></input>
                        <div className="light"></div>
                        <span className="label">Amp</span>
                      </label>
                    </div>
                    <div className="destination">
                      <label htmlFor="filter">
                        <input type="radio" name="destination" value="filter" id="filter"></input>
                        <div className="light"></div>
                        <span className="label">Filter</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="comp amp envelope">
                <h2>Amp Env.</h2>
                <div className="slidecontainer">
                  <input type="range" min="0" max="3" step="0.001"
                      value={ this.state.ampEnvelope.attack } 
                      onChange={ event => this.setAmpAttack(event.target.value) }
                      className="slider" id="myRange"></input>
                </div>
                <div className="slidecontainer">
                  <input type="range" min="0" max="3" step="0.001"
                      value={ this.state.ampEnvelope.decay } 
                      onChange={ event => this.setAmpDecay(event.target.value) }
                      className="slider" id="myRange"></input>
                </div>
                <div className="slidecontainer">
                  <input type="range" min="0" max="1" step="0.001"
                      value={ this.state.ampEnvelope.sustain } 
                      onChange={ event => this.setAmpSustain(event.target.value) }
                      className="slider" id="myRange"></input>
                </div>
                <div className="slidecontainer">
                  <input type="range" min="0" max="3" step="0.001"
                      value={ this.state.ampEnvelope.release } 
                      onChange={ event => this.setAmpRelease(event.target.value) }
                      className="slider" id="myRange"></input>
                </div>
                <div className="label">A</div>
                <div className="label">D</div>
                <div className="label">S</div>
                <div className="label">R</div>
              </div>
            </div>
        );
    }
}


export default Synth;