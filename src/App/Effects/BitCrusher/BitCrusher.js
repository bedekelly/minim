import React from 'react';
import Knob from '../../Knob';

import './BitCrusher.css';


export default class BitCrusher extends React.Component {
    
    constructor(props) {
        super(props);
        this.audio = this.props.appAudio.effects[this.props.id];
        this.state = {
            bitDepth: this.audio.bitDepth,
            frequencyReduction: this.audio.frequencyReduction
        }
    }
    
    changeBitDepth(bitDepth) {
        this.audio.bitDepth = bitDepth;
        this.setState({ bitDepth });
    }
    
    changeFrequencyReduction(frequencyReduction) {
        this.audio.frequencyReduction = frequencyReduction;
        this.setState({ frequencyReduction });
    }
    
    render() {
        return <div className="bit-crusher">
            Bit Depth: 
            <Knob min={1} max={16} 
                value={ this.state.bitDepth }
                default={ 12 }
                id={ this.props.id + "-bit-depth" }
                appAudio={ this.audio.appAudio }
                onChange={ value => this.changeBitDepth(value) }
                />
            Frequency Reduction: 
            <Knob min={0} max={1} 
                value={ this.state.frequencyReduction }
                default={ 0.5 }
                id={ this.props.id + "-frequency-reduction"}
                appAudio={ this.audio.appAudio }
                onChange={ value => this.changeFrequencyReduction(value) }
                />
        </div>
    }
}