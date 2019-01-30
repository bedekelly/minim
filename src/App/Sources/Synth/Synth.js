import React from 'react';

import './Synth.css';


class Synth extends React.Component {
    
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
                    <input type="radio" name="waveform" value="sine" id="sine"></input>
                    <div className="light"></div>
                    <img src='https://s3-us-west-2.amazonaws.com/s.cdpn.io/1415658/sinepro.svg' alt=''></img>
                  </label>
                </div>

                <div className="waveform">
                  <label htmlFor="sawtooth">
                    <input type="radio" name="waveform" value="sawtooth" id="sawtooth"></input>
                    <div className="light"></div>
                    <img src='https://s3-us-west-2.amazonaws.com/s.cdpn.io/1415658/sawtoothpro.svg' alt=''></img>
                  </label>
                </div>

                <div className="waveform">
                  <label htmlFor="triangle">
                    <input type="radio" name="waveform" value="triangle" id="triangle"></input>
                    <div className="light"></div>
                    <img src='https://s3-us-west-2.amazonaws.com/s.cdpn.io/1415658/trianglepro.svg' alt=''></img>
                  </label>
                </div>

                <div className="waveform square">
                  <label htmlFor="square">
                    <input type="radio" name="waveform" value="square" id="square"></input>
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
                    <input type="radio" name="waveform-two" value="sine2" id="sine2"></input>
                    <div className="light"></div>
                    <img src='https://s3-us-west-2.amazonaws.com/s.cdpn.io/1415658/sinepro.svg' alt=''></img>
                  </label>
                </div>

                <div className="waveform">
                  <label htmlFor="sawtooth2">
                    <input type="radio" name="waveform-two" value="sawtooth2" id="sawtooth2"></input>
                    <div className="light"></div>
                    <img src='https://s3-us-west-2.amazonaws.com/s.cdpn.io/1415658/sawtoothpro.svg' alt=''></img>
                  </label>
                </div>

                <div className="waveform">
                  <label htmlFor="triangle2">
                    <input type="radio" name="waveform-two" value="triangle2" id="triangle2"></input>
                    <div className="light"></div>
                    <img src='https://s3-us-west-2.amazonaws.com/s.cdpn.io/1415658/trianglepro.svg' alt=''></img>
                  </label>
                </div>

                <div className="waveform square">
                  <label htmlFor="square2">
                    <input type="radio" name="waveform-two" value="square2" id="square2"></input>
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
                        <span className="label">Amp.</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="comp amp envelope">
                <h2>Amp Env.</h2>
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
            </div>
        );
    }
}


export default Synth;