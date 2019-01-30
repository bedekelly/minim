import React from 'react';

import './Synth.css';


class Synth extends React.Component {
    
    render() {
        return (
            <div class="synth">
              <div class="comp osc one">
                <div class="knobs">
                  <div class="knob"></div>
                  <div class="label">Oct</div>
                  <div class="knob"></div>
                  <div class="label">Semi</div>
                  <div class="knob"></div>
                  <div class="label">Tune</div>
                </div>

                <div class="waveform">
                  <label for="sine">
                    <input type="radio" name="waveform" value="sine" id="sine"></input>
                    <div class="light"></div>
                    <img src='https://s3-us-west-2.amazonaws.com/s.cdpn.io/1415658/sinepro.svg' alt=''></img>
                  </label>
                </div>

                <div class="waveform">
                  <label for="sawtooth">
                    <input type="radio" name="waveform" value="sawtooth" id="sawtooth"></input>
                    <div class="light"></div>
                    <img src='https://s3-us-west-2.amazonaws.com/s.cdpn.io/1415658/sawtoothpro.svg' alt=''></img>
                  </label>
                </div>

                <div class="waveform">
                  <label for="triangle">
                    <input type="radio" name="waveform" value="triangle" id="triangle"></input>
                    <div class="light"></div>
                    <img src='https://s3-us-west-2.amazonaws.com/s.cdpn.io/1415658/trianglepro.svg' alt=''></img>
                  </label>
                </div>

                <div class="waveform square">
                  <label for="square">
                    <input type="radio" name="waveform" value="square" id="square"></input>
                    <div class="light"></div>
                    <img src='https://s3-us-west-2.amazonaws.com/s.cdpn.io/1415658/squarepro.svg' alt=''></img>
                  </label>
                </div>

              </div>
              <div class="comp osc two">
                <div class="knobs">
                  <div class="knob"></div>
                  <div class="label">Oct</div>
                  <div class="knob"></div>
                  <div class="label">Semi</div>
                  <div class="knob"></div>
                  <div class="label">Tune</div>
                </div>

                <div class="waveform">
                  <label for="sine2">
                    <input type="radio" name="waveform-two" value="sine2" id="sine2"></input>
                    <div class="light"></div>
                    <img src='https://s3-us-west-2.amazonaws.com/s.cdpn.io/1415658/sinepro.svg' alt=''></img>
                  </label>
                </div>

                <div class="waveform">
                  <label for="sawtooth2">
                    <input type="radio" name="waveform-two" value="sawtooth2" id="sawtooth2"></input>
                    <div class="light"></div>
                    <img src='https://s3-us-west-2.amazonaws.com/s.cdpn.io/1415658/sawtoothpro.svg' alt=''></img>
                  </label>
                </div>

                <div class="waveform">
                  <label for="triangle2">
                    <input type="radio" name="waveform-two" value="triangle2" id="triangle2"></input>
                    <div class="light"></div>
                    <img src='https://s3-us-west-2.amazonaws.com/s.cdpn.io/1415658/trianglepro.svg' alt=''></img>
                  </label>
                </div>

                <div class="waveform square">
                  <label for="square2">
                    <input type="radio" name="waveform-two" value="square2" id="square2"></input>
                    <div class="light"></div>
                    <img src='https://s3-us-west-2.amazonaws.com/s.cdpn.io/1415658/squarepro.svg' alt=''></img>
                  </label>
                </div>

              </div>
              <div class="comp filter-freq">
                <h2>Filter <span class="filter-type">HP</span></h2>
                <div class="knobs">
                  <div class="knob freq"></div>
                  <div class="label freq">Freq</div>
                  <div class="knob res"></div>
                  <div class="label res">Res</div>
                </div>
              </div>
              <div class="comp envelope filter-envelope">
                <h2>Filter Env.</h2>
                <div class="slidecontainer">
                  <input type="range" min="1" max="100" value="50" class="slider" id="myRange"></input>
                </div>
                <div class="slidecontainer">
                  <input type="range" min="1" max="100" value="50" class="slider" id="myRange"></input>
                </div>
                <div class="slidecontainer">
                  <input type="range" min="1" max="100" value="50" class="slider" id="myRange"></input>
                </div>
                <div class="slidecontainer">
                  <input type="range" min="1" max="100" value="50" class="slider" id="myRange"></input>
                </div>
                <div class="label">A</div>
                <div class="label">D</div>
                <div class="label">S</div>
                <div class="label">R</div>
              </div>
              <div class="comp lfo">
                <h2>LFO</h2>
                <div class="lfo-layout">
                  <div class="knob"></div>
                  <div class="label">Rate</div>
                  <div class="destinations">
                    <div class="destination">
                      <label for="pitch">
                        <input type="radio" name="destination" value="destination" id="pitch"></input>
                        <div class="light"></div>
                        <span class="label">Pitch</span>
                      </label>
                    </div>
                    <div class="destination">
                      <label for="envelope amplitude-envelope">
                        <input type="radio" name="destination" value="destination" id="amplitude"></input>
                        <div class="light"></div>
                        <span class="label">Amp.</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div class="comp amp envelope">
                <h2>Amp Env.</h2>
                <div class="slidecontainer">
                  <input type="range" min="1" max="100" value="50" class="slider" id="myRange"></input>
                </div>
                <div class="slidecontainer">
                  <input type="range" min="1" max="100" value="50" class="slider" id="myRange"></input>
                </div>
                <div class="slidecontainer">
                  <input type="range" min="1" max="100" value="50" class="slider" id="myRange"></input>
                </div>
                <div class="slidecontainer">
                  <input type="range" min="1" max="100" value="50" class="slider" id="myRange"></input>
                </div>
                <div class="label">A</div>
                <div class="label">D</div>
                <div class="label">S</div>
                <div class="label">R</div>
              </div>
            </div>
        );
    }
}


export default Synth;