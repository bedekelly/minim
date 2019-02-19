import React from "react";

import './Gain.css';
import Knob from '../../Knob/Knob';


class Gain extends React.Component {
    
    MIN_GAIN = 0;
    MAX_GAIN = 5;
    DEFAULT_GAIN = 1;
    
    constructor(props) {
        super(props);
        this.gainAudio = this.props.appAudio.effects[this.props.id];
        this.state = {
            value: this.gainAudio.value
        }
    }
    
    setGain(value) {
        this.setState({ value });
        this.gainAudio.value = value;
    }

    render() {
        return <div className="gain">
            <Knob min={ this.MIN_GAIN } max={ this.MAX_GAIN } 
                value={this.state.value} 
                onChange={value => this.setGain(value)}
                scale={ 100 }
                precision={ 0 }
                units="%"
                label="Volume"
                appAudio={ this.props.appAudio }
                id={ `${this.props.id}-gain` }
                default={ this.DEFAULT_GAIN }
                />
        </div>
    }
}


export default Gain;
