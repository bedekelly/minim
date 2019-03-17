import React from 'react';

import Knob from 'Components/Knob';

import SawtoothIcon from './sawtooth.svg';
import SineIcon from './sine.svg';
import SquareIcon from './square.svg';
import TriangleIcon from './triangle.svg';


const CLASSNAMES = {
    1: "one",
    2: "two"
};


export default class Oscillator extends React.Component {
    
    constructor(props) {
        super(props);
        this.audio = props.appAudio.sources[this.props.id];
        this.num = this.props.num + 1;
        this.osc = `osc${this.num}`;
        this.state = {
            waveform: this.audio[this.osc].waveform,
            octave: this.audio[this.osc].octave,
            semi: this.audio[this.osc].semi,
            tune: this.audio[this.osc].tune
        }
    }

    changeWaveform(waveform) {
        this.props.audio[this.osc].waveform = waveform;
        this.setState({ waveform });
    }
    
    changeOctave(octave) {
        octave = Math.round(octave);
        this.audio[`${this.osc}Oct`] = octave;
        this.setState({ octave })
    }
    
    changeSemi(semi) {
        semi = Math.round(semi);
        this.audio[`${this.osc}Semi`] = semi;
        this.setState({ semi });
    }
    
    changeTune(tune) {
        tune = Math.round(tune);
        this.audio[`${this.osc}Tune`] = tune;
        this.setState({ tune });
    }
    
    render() {
        const osc = this.osc;
        const outerClassname = `comp osc ${CLASSNAMES[this.num]}`;
        const waveLabel = `waveform-${this.props.id}-${this.num}`;

        return <div className={ outerClassname }>
          <div className="knobs">
            <Knob min={-3} max={3} value={this.state.octave} precision={ 0 }
                  default={ 0 }
                  appAudio={ this.props.appAudio }
                  label="Octave"
                  id={`${this.props.id}-${osc}-octave`}
                  onChange={ value => this.changeOctave(value) } />
            <div className="label">Oct</div>
            <Knob min={-12} max={12} value={this.state.semi} precision={ 0 }
                  default={ 0 }
                  label="Semi"
                  appAudio={ this.props.appAudio }
                  id={ `${this.props.id}-${osc}-semi` }
                  onChange={ value => this.changeSemi(value) } />
            <div className="label">Semi</div>
            <Knob min={-50} max={50} value={this.state.tune} precision={ 0 }
                  default={ 0 }
                  label="Tune"
                  appAudio={ this.props.appAudio }
                  id={ `${this.props.id}-${osc}-tune` }
                  onChange={ value => this.changeTune(value) } />
            <div className="label">Tune</div>
          </div>

          <div className="waveform">
            <label htmlFor={"sine" + waveLabel}>
              <input type="radio" name={ waveLabel } value="sine" id={"sine" + waveLabel}
                  checked={ this.state.waveform === "sine" }
                  onChange={ e => this.changeWaveform("sine") }
                  />
              <div className="light" />
              <img src={ SineIcon } alt='' />
            </label>
          </div>

          <div className="waveform">
            <label htmlFor={"sawtooth" + waveLabel}>
              <input type="radio" name={waveLabel} value="sawtooth" id={"sawtooth" + waveLabel}
                  checked={ this.state.waveform === "sawtooth" }
                  onChange={ e => this.changeWaveform("sawtooth") }
                  />
              <div className="light"/>
              <img src={ SawtoothIcon } alt=''/>
            </label>
          </div>

          <div className="waveform">
            <label htmlFor={"triangle" + waveLabel}>
              <input type="radio" name={waveLabel} value="triangle" id={"triangle" + waveLabel}
                  checked={ this.state.waveform === "triangle" }
                  onChange={ e => this.changeWaveform("triangle") }
                  />
              <div className="light" />
              <img src={ TriangleIcon } alt='' />
            </label>
          </div>

          <div className="waveform square">
            <label htmlFor={"square" + waveLabel}>
              <input type="radio" name={waveLabel} value="square" id={"square" + waveLabel}
                  checked={ this.state.waveform === "square" }
                  onChange={ () => this.changeWaveform("square") }
                  />
              <div className="light" />
              <img src={ SquareIcon } alt='' />
            </label>
          </div>

        </div>
    }
}