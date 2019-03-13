import React from 'react';
import Knob from 'Components/Knob';
import './Compressor.css';

class Compressor extends React.Component {
    
    constructor(props) {
        super(props);
        this.compressorAudio = this.props.appAudio.effects[this.props.id];
        const {
            threshold, knee, attack, release
        } = this.compressorAudio;
        this.state = { threshold, knee, ratio: 1.5, attack, release };
    }
    
    change(key, value) {
        this.compressorAudio[key] = value;
        this.setState({[key]: value})
    }
    
    temporaryDry() {
        this.compressorAudio.temporaryDry();
    }
    
    temporaryDryOff() {
        this.compressorAudio.temporaryDryOff();
    }
    
    render() {
        return <div className="compressor">
          <div className="control">
            <Knob min={-100} max={0} 
                value={this.state.threshold} 
                default={ -24 }
                units="dB"
                label="Threshold"
                appAudio={ this.props.appAudio }
                id={ this.props.id + "-threshold" }
                onChange={value => this.change("threshold", value)} />
            <div className="knob-title">Threshold</div>
          </div>
          <div className="control">
            <Knob min={0} max={40} 
                value={this.state.knee} 
                default={ 30 }
                label="Knee"
                appAudio={ this.props.appAudio }
                id={ this.props.id + "-knee" }
                onChange={value => this.change("knee", value)} />
            <div className="knob-title">Knee</div>
          </div>
          <div className="control">
            <Knob min={1} max={20} 
                value={this.state.ratio} 
                default={ 1.5 }
                label="Ratio"
                appAudio={ this.props.appAudio }
                id={ this.props.id + "-ratio" }
                onChange={value => this.change("ratio", value)} />
            <div className="knob-title">Ratio</div>
          </div>
          <div className="control">
            <Knob min={0} max={1} 
                value={this.state.attack} 
                default={ 0.003 }
                label="Attack"
                units="s"
                appAudio={ this.props.appAudio }
                id={ this.props.id + "-attack" }
                onChange={value => this.change("attack", value)} />
            <div className="knob-title">Attack</div>
          </div>
          
          <div className="control">
            <Knob min={0} max={1} 
                value={this.state.release} 
                default={ 0.25 }
                label="Release"
                units="s"
                appAudio={ this.props.appAudio }
                id={ this.props.id + "-release" }
                onChange={value => this.change("release", value)} />
            <div className="knob-title">Release</div>
          </div>

          <div className="control">
            <button className="active" 
                onMouseDown={() => this.temporaryDry()}
                onMouseUp={() => this.temporaryDryOff()}></button>
            <div className="knob-title">Toggle</div>
          </div>
          
        </div>
    }
}


export default Compressor;