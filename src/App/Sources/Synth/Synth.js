import React from 'react';

import './Synth.css';

import Knob from '../../Knob';

import FilterFrequency from './FilterFrequency';
import FilterEnvelope from './FilterEnvelope';
import LFO from './LFO';
import AmpEnvelope from './AmpEnvelope';

import SawtoothIcon from './sawtooth.svg';
import SineIcon from './sine.svg';
import SquareIcon from './square.svg';
import TriangleIcon from './triangle.svg';


class Synth extends React.PureComponent {
    
    constructor(props) {
        super(props);
        this.audio = props.appAudio.sources[props.id];
        this.state = {
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
            }
        }
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
    
    changeOsc1Octave(value) {
        value = Math.round(value);
        this.audio.osc1Oct = value;
        const osc1 = this.state.osc1;
        this.setState({ osc1: { ...osc1, octave: value }})
    }
    
    changeOsc1Semi(value) {
        value = Math.round(value);
        this.audio.osc1Semi = value;
        const osc1 = this.state.osc1;
        this.setState({ osc1: { ...osc1, semi: value }})
    }
    
    changeOsc1Tune(value) {
        value = Math.round(value);
        this.audio.osc1Tune = value;
        const osc1 = this.state.osc1;
        this.setState({ osc1: { ...osc1, tune: value }})
    }
    
    changeOsc2Octave(value) {
        value = Math.round(value);
        this.audio.osc2Oct = value;
        const osc2 = this.state.osc2;
        this.setState({ osc2: { ...osc2, octave: value }})
    }
    
    changeOsc2Semi(value) {
        value = Math.round(value);
        this.audio.osc2Semi = value;
        const osc2 = this.state.osc2;
        this.setState({ osc2: { ...osc2, semi: value }})
    }
    
    changeOsc2Tune(value) {
        value = Math.round(value);
        this.audio.osc2Tune = value;
        const osc2 = this.state.osc2;
        this.setState({ osc2: { ...osc2, tune: value }})
    }    
    
    render() {
        return (
            <div className="synth">
              <div className="comp osc one">
                <div className="knobs">
                  <Knob min={-3} max={3} value={this.state.osc1.octave} precision={ 0 }
                        default={ 0 }
                        appAudio={ this.props.appAudio }
                        label="Octave"
                        id={ this.props.id + "-osc1-octave" }
                        onChange={ value => this.changeOsc1Octave(value) }></Knob>
                  <div className="label">Oct</div>
                  <Knob min={-12} max={12} value={this.state.osc1.semi} precision={ 0 }
                        default={ 0 }
                        label="Semi"
                        appAudio={ this.props.appAudio }
                        id={ this.props.id + "-osc1-semi" }
                        onChange={ value => this.changeOsc1Semi(value) }></Knob>
                  <div className="label">Semi</div>
                  <Knob min={-50} max={50} value={this.state.osc1.tune} precision={ 0 }
                        default={ 0 }
                        label="Tune"
                        appAudio={ this.props.appAudio }
                        id={ this.props.id + "-osc1-tune" }
                        onChange={ value => this.changeOsc1Tune(value) }></Knob>
                  <div className="label">Tune</div>
                </div>

                <div className="waveform">
                  <label htmlFor={"sine" +this.props.id}>
                    <input type="radio" name={"waveform" + this.props.id} value="sine" id={"sine" +this.props.id}
                        checked={ this.state.osc1.waveform === "sine" }
                        onChange={ e => this.changeOsc1Waveform(e.target.value) }
                        ></input>
                    <div className="light"></div>
                    <img src={ SineIcon } alt=''></img>
                  </label>
                </div>

                <div className="waveform">
                  <label htmlFor={"sawtooth" + this.props.id}>
                    <input type="radio" name={"waveform" + this.props.id} value="sawtooth" id={"sawtooth" +this.props.id}
                        checked={ this.state.osc1.waveform === "sawtooth" }
                        onChange={ e => this.changeOsc1Waveform(e.target.value) }
                        ></input>
                    <div className="light"></div>
                    <img src={ SawtoothIcon } alt=''></img>
                  </label>
                </div>

                <div className="waveform">
                  <label htmlFor={"triangle" + this.props.id}>
                    <input type="radio" name={"waveform" + this.props.id} value="triangle" id={"triangle" +this.props.id}
                        checked={ this.state.osc1.waveform === "triangle" }
                        onChange={ e => this.changeOsc1Waveform(e.target.value) }
                        ></input>
                    <div className="light"></div>
                    <img src={ TriangleIcon } alt=''></img>
                  </label>
                </div>

                <div className="waveform square">
                  <label htmlFor={"square" + this.props.id}>
                    <input type="radio" name={"waveform" + this.props.id} value="square" id={"square" + this.props.id}
                        checked={ this.state.osc1.waveform === "square" }
                        onChange={ e => this.changeOsc1Waveform(e.target.value) }
                        ></input>
                    <div className="light"></div>
                    <img src={ SquareIcon } alt=''></img>
                  </label>
                </div>

              </div>
              <div className="comp osc two">
                <div className="knobs">
                  <Knob min={-3} max={3} value={this.state.osc2.octave} precision={ 0 }
                        appAudio={ this.props.appAudio }
                        default={ 0 }
                        label="Octave"
                        id={ this.props.id + "-osc2-octave" }
                        onChange={ value => this.changeOsc2Octave(value) }></Knob>
                  <div className="label">Oct</div>
                  <Knob min={-12} max={12} value={this.state.osc2.semi} precision={ 0 }
                        appAudio={ this.props.appAudio }
                        default={ 0 }
                        label="Semi"
                        id={ this.props.id + "-osc2-semi" }
                        onChange={ value => this.changeOsc2Semi(value) }></Knob>
                  <div className="label">Semi</div>
                  <Knob min={-50} max={50} value={this.state.osc2.tune} precision={ 0 }
                        appAudio={ this.props.appAudio }
                        default={ 0 }
                        label="Tune"
                        id={ this.props.id + "-osc2-tune" }
                        onChange={ value => this.changeOsc2Tune(value) }></Knob>
                  <div className="label">Tune</div>
                </div>

                <div className="waveform">
                  <label htmlFor={"sine2" + this.props.id}>
                    <input type="radio" name={"waveform-two"+this.props.id} value="sine" id={"sine2" + this.props.id}
                        checked={ this.state.osc2.waveform === "sine" }
                        onChange={ e => this.changeOsc2Waveform(e.target.value) }
                        ></input>
                    <div className="light"></div>
                    <img src={ SineIcon } alt=''></img>
                  </label>
                </div>

                <div className="waveform">
                  <label htmlFor={"sawtooth2"+this.props.id}>
                    <input type="radio" name={"waveform-two"+this.props.id} value="sawtooth" id={"sawtooth2"+this.props.id}
                        checked={ this.state.osc2.waveform === "sawtooth" }
                        onChange={ e => this.changeOsc2Waveform(e.target.value) }
                        ></input>
                    <div className="light"></div>
                    <img src={ SawtoothIcon } alt=''></img>
                  </label>
                </div>

                <div className="waveform">
                  <label htmlFor={"triangle2"+this.props.id}>
                    <input type="radio" name={"waveform-two"+this.props.id} value="triangle" id={"triangle2"+this.props.id}
                        checked={ this.state.osc2.waveform === "triangle" }
                        onChange={ e => this.changeOsc2Waveform(e.target.value) }
                        ></input>
                    <div className="light"></div>
                    <img src={ TriangleIcon } alt=''></img>
                  </label>
                </div>

                <div className="waveform square">
                  <label htmlFor={"square2"+this.props.id}>
                    <input type="radio" name={"waveform-two"+this.props.id} value="square" id={"square2"+this.props.id}
                        checked={ this.state.osc2.waveform === "square" }
                        onChange={ e => this.changeOsc2Waveform(e.target.value) }
                        ></input>
                    <div className="light"></div>
                    <img src={ SquareIcon } alt=''></img>
                  </label>
                </div>

              </div>
              <FilterFrequency id={ this.props.id } audio={ this.audio } appAudio={ this.props.appAudio } />
              <FilterEnvelope id={ this.props.id } audio={ this.audio } appAudio={ this.props.appAudio } />
              <LFO id={ this.props.id } audio={ this.audio } appAudio={ this.props.appAudio } />
              <AmpEnvelope id={ this.props.id } audio={ this.audio } appAudio={ this.props.appAudio } />
            </div>              
        );
    }
}


export default Synth;