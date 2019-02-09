import React from 'react';

import './Synth.css';

import Knob from '../../Knob';
import Slider from '../../Slider';


const filterTypes = {
    "LP": { next: "HP", audio: "lowpass", qLabel: "Res" },
    "HP": { next: "BP", audio: "highpass", qLabel: "Res" },
    "BP": { next: "NT", audio: "bandpass", qLabel: "Width" },
    "NT": { next: "AP", audio: "notch", qLabel: "Width" },
    "AP": { next: "LP", audio: "allpass", qLabel: "Sharp" }
}


class Synth extends React.PureComponent {
    
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
                waveform: this.audio.osc1.waveform,
                octave: this.audio.osc1.octave,
                semi: this.audio.osc1.semi,
                tune: this.audio.osc2.tune
            },
            osc2: {
                waveform: this.audio.osc2.waveform,
                octave: this.audio.osc2.octave,
                semi: this.audio.osc2.semi,
                tune: this.audio.osc2.tune
            },
            lfo: {
                rate: this.audio.lfo.rate,
                destination: this.audio.lfo.destination
            },
            filterFreq: this.audio.filter.freq,
            filterRes: this.audio.filter.res,
            filter: {
                type: "LP"
            },
            filterEnvelope: this.audio.filterEnvelope
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
        const osc1 = this.state.osc1;
        this.setState({ osc1: { ...osc1, waveform }})
    }
    
    changeOsc2Waveform(waveform) {
        this.audio.osc2.waveform = waveform;
        const osc2 = this.state.osc2;
        this.setState({ osc2: { ...osc2, waveform }})
    }
    
    changeLFODestination(destination) {
        this.audio.lfoDestination = destination;
        const lfo = this.state.lfo;
        this.setState({ lfo: { ...lfo, destination }});
    }
    
    setLFORate(rate) {
        this.audio.lfoRate = rate;
        const lfo = this.state.lfo;
        this.setState({ lfo: { ...lfo, rate }});
    }
    
    changeOsc1Octave(value) {
        value = Math.round(value);
        this.audio.osc1.octave = value;
        const osc1 = this.state.osc1;
        this.setState({ osc1: { ...osc1, octave: value }})
    }
    
    changeOsc1Semi(value) {
        value = Math.round(value);
        this.audio.osc1.semi = value;
        const osc1 = this.state.osc1;
        this.setState({ osc1: { ...osc1, semi: value }})
    }
    
    changeOsc1Tune(value) {
        value = Math.round(value);
        this.audio.osc1.tune = value;
        const osc1 = this.state.osc1;
        this.setState({ osc1: { ...osc1, tune: value }})
    }
    
    changeOsc2Octave(value) {
        value = Math.round(value);
        this.audio.osc2.octave = value;
        const osc2 = this.state.osc2;
        this.setState({ osc2: { ...osc2, octave: value }})
    }
    
    changeOsc2Semi(value) {
        value = Math.round(value);
        this.audio.osc2.semi = value;
        const osc2 = this.state.osc2;
        this.setState({ osc2: { ...osc2, semi: value }})
    }
    
    changeOsc2Tune(value) {
        value = Math.round(value);
        this.audio.osc2.tune = value;
        const osc2 = this.state.osc2;
        this.setState({ osc2: { ...osc2, tune: value }})
    }
    
    changeFilterFreq(value) {
        this.audio.filterFreq = value;
        this.setState({ filterFreq: value });
    }
    
    changeFilterRes(value) {
        this.audio.filterRes = value;
        this.setState({ filterRes: value });
    }
    
    nextFilterType() {
        const currentType = this.state.filter.type;
        const { next } = filterTypes[currentType];
        this.changeFilterType(next);
    }
    
    changeFilterType(value) {
        const filter = this.state.filter;
        this.audio.filterType = filterTypes[value].audio;
        this.setState({ filter: { ...filter, type: value }});
    }
    
    setFilterAttack(attack) {
        attack = parseFloat(attack);
        const filterEnvelope = this.state.filterEnvelope;
        this.audio.filterEnvelope.attack = attack;
        this.setState({ filterEnvelope: { ...filterEnvelope, attack }})
    }
    
    setFilterDecay(decay) {
        decay = parseFloat(decay);
        const filterEnvelope = this.state.filterEnvelope;
        this.audio.filterEnvelope.decay = decay;
        this.setState({ filterEnvelope: { ...filterEnvelope, decay }})
    }
    
    setFilterSustain(sustain) {
        sustain = parseFloat(sustain);
        const filterEnvelope = this.state.filterEnvelope;
        this.audio.filterEnvelope.sustain = sustain;
        this.setState({ filterEnvelope: { ...filterEnvelope, sustain }})
    }
    
    setFilterRelease(release) {
        release = parseFloat(release);
        const filterEnvelope = this.state.filterEnvelope;
        this.audio.filterEnvelope.release = release;
        this.setState({ filterEnvelope: { ...filterEnvelope, release }})
    }
    
    render() {
        return (
            <div className="synth">
              <div className="comp osc one">
                <div className="knobs">
                  <Knob min={-3} max={3} value={this.state.osc1.octave} precision={ 0 }
                        appAudio={ this.props.appAudio }
                        id={ this.props.id + "-osc1-octave" }
                        onChange={ value => this.changeOsc1Octave(value) }></Knob>
                  <div className="label">Oct</div>
                  <Knob min={-12} max={12} value={this.state.osc1.semi} precision={ 0 }
                        appAudio={ this.props.appAudio }
                        id={ this.props.id + "-osc1-semi" }
                        onChange={ value => this.changeOsc1Semi(value) }></Knob>
                  <div className="label">Semi</div>
                  <Knob min={-50} max={50} value={this.state.osc1.tune} precision={ 0 }
                        appAudio={ this.props.appAudio }
                        id={ this.props.id + "-osc1-tune" }
                        onChange={ value => this.changeOsc1Tune(value) }></Knob>
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
                  <Knob min={-3} max={3} value={this.state.osc2.octave} precision={ 0 }
                        appAudio={ this.props.appAudio }
                        id={ this.props.id + "-osc2-octave" }
                        onChange={ value => this.changeOsc2Octave(value) }></Knob>
                  <div className="label">Oct</div>
                  <Knob min={-12} max={12} value={this.state.osc2.semi} precision={ 0 }
                        appAudio={ this.props.appAudio }
                        id={ this.props.id + "-osc2-semi" }
                        onChange={ value => this.changeOsc2Semi(value) }></Knob>
                  <div className="label">Semi</div>
                  <Knob min={-50} max={50} value={this.state.osc2.tune} precision={ 0 }
                        appAudio={ this.props.appAudio }
                        id={ this.props.id + "-osc2-tune" }
                        onChange={ value => this.changeOsc2Tune(value) }></Knob>
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
                <h2>Filter <span className="filter-type" 
                                 onClick={ () => this.nextFilterType() }
                                 >{ this.state.filter.type }</span></h2>
                <div className="knobs">
                  <Knob min={0} max={1000} value={this.state.filterFreq}
                        onChange={value => this.changeFilterFreq(value)}
                        appAudio={ this.props.appAudio }
                        id={ this.props.id + "-filter-freq" }
                        midiLearn={ () => this.midiLearn("setFilterFrequency", 0, 1000) }></Knob>
                  <div className="label freq">Freq</div>
                  <Knob min={0} max={30} value={this.state.filterRes}
                        appAudio={ this.props.appAudio }
                        id={ this.props.id + "-filter-res" }
                        onChange={value => this.changeFilterRes(value)}
                        midiLearn={ () => this.midiLearn("setFilterResonance", 0, 30) }></Knob>
                    <div className="label res">
                        { filterTypes[this.state.filter.type].qLabel}
                    </div>
                </div>
              </div>
              <div className="comp envelope filter-envelope">
                <h2>Filter Env.</h2>
                <div className="slidecontainer">
                    <Slider min={ 0 } max={ 3 } step={ 0.01 } 
                        value={ this.state.filterEnvelope.attack }
                        onChange={ value => this.setFilterAttack(value) }
                        appAudio={ this.props.appAudio }
                        id={ this.props.id + "-filter-attack" }
                        ></Slider>
                </div>
                <div className="slidecontainer">
                    <Slider min={ 0 } max={ 3 } step={ 0.01 } 
                        value={ this.state.filterEnvelope.decay }
                        onChange={ value => this.setFilterDecay(value) }
                        appAudio={ this.props.appAudio }
                        id={ this.props.id + "-filter-decay" }
                        ></Slider>
                </div>
                <div className="slidecontainer">
                    <Slider min={ 0 } max={ 1 } step={ 0.01 } 
                        value={ this.state.filterEnvelope.sustain }
                        onChange={ value => this.setFilterSustain(value) }
                        appAudio={ this.props.appAudio }
                        id={ this.props.id + "-filter-sustain" }
                        ></Slider>
                </div>
                <div className="slidecontainer">
                    <Slider min={ 0.01 } max={ 3 } step={ 0.01 } 
                        value={ this.state.filterEnvelope.release }
                        onChange={ value => this.setFilterRelease(value) }
                        appAudio={ this.props.appAudio }
                        id={ this.props.id + "-filter-release" }
                        ></Slider>
                </div>
                <div className="label">A</div>
                <div className="label">D</div>
                <div className="label">S</div>
                <div className="label">R</div>
              </div>
              <div className="comp lfo">
                <h2>LFO</h2>
                <div className="lfo-layout">
                  <Knob min={ 0 } max={ 25 } value={ this.state.lfo.rate }
                        onChange={ value => this.setLFORate(value) }
                        appAudio={ this.props.appAudio }
                        id={ this.props.id + "-lfo-rate" }
                        ></Knob>
                  <div className="label">Rate</div>
                  <div className="destinations">
                    <div className="destination">
                      <label htmlFor="pitch">
                        <input type="radio" name="destination" value="pitch" id="pitch" 
                            checked={ this.state.lfo.destination === "pitch" }
                            onChange={ e => this.changeLFODestination(e.target.value) }
                            ></input>
                        <div className="light"></div>
                        <span className="label">Pitch</span>
                      </label>
                    </div>
                    <div className="destination">
                      <label htmlFor="amplitude">
                        <input type="radio" name="destination" value="amplitude" id="amplitude" 
                            checked={ this.state.lfo.destination === "amplitude" }
                            onChange={ e => this.changeLFODestination(e.target.value) }
                            ></input>
                        <div className="light"></div>
                        <span className="label">Amp</span>
                      </label>
                    </div>
                    <div className="destination">
                      <label htmlFor="filter">
                        <input type="radio" name="destination" value="filter" id="filter" 
                            checked={ this.state.lfo.destination === "filter" }
                            onChange={ e => this.changeLFODestination(e.target.value) }
                            ></input>
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
                    <Slider min={ 0 } max={ 3 } step={ 0.001 } 
                        value={ this.state.ampEnvelope.attack }
                        onChange={ value => this.setAmpAttack(value) }
                        appAudio={ this.props.appAudio }
                        id={ this.props.id + "-amp-attack" }
                        ></Slider>
                </div>
                <div className="slidecontainer">
                    <Slider min={ 0 } max={ 3 } step={ 0.001 } 
                        value={ this.state.ampEnvelope.decay }
                        onChange={ value => this.setAmpDecay(value) }
                        appAudio={ this.props.appAudio }
                        id={ this.props.id + "-amp-decay" }
                        ></Slider>
                </div>
                <div className="slidecontainer">
                    <Slider min={ 0 } max={ 1 } step={ 0.001 } 
                        value={ this.state.ampEnvelope.sustain }
                        onChange={ value => this.setAmpSustain(value) }
                        appAudio={ this.props.appAudio }
                        id={ this.props.id + "-amp-sustain" }
                        ></Slider>
                </div>
                <div className="slidecontainer">
                    <Slider min={ 0.001 } max={ 3 } step={ 0.001 } 
                        value={ this.state.ampEnvelope.release }
                        onChange={ value => this.setAmpRelease(value) }
                        appAudio={ this.props.appAudio }
                        id={ this.props.id + "-amp-release" }
                        ></Slider>
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