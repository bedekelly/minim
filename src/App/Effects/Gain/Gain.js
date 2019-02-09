import React from "react";

import './Gain.css';
import Knob from '../../Knob/Knob';


/**
 * Linearly map a value from one range to another.
 */
function linMap(value, fromLower, fromUpper, toLower, toUpper) {
    const lowerRange = fromUpper - fromLower;
    const upperRange = toUpper - toLower;
    const magnitudeThroughLowerRange = (value - fromLower);
    const fractionThroughRange = magnitudeThroughLowerRange / lowerRange;
    const magnitudeThroughUpperRange = fractionThroughRange * upperRange;
    const valueInUpperRange = toLower + magnitudeThroughUpperRange;
    return valueInUpperRange;
}



class Gain extends React.Component {
    
    MIN_GAIN = 0;
    MAX_GAIN = 5;
    
    constructor(props) {
        super(props);
        this.gainAudio = this.props.appAudio.effects[this.props.id];
        this.state = {
            value: this.gainAudio.value
        }
    }
    
    midiLearn() {
        console.log("MIDI learning...")
        this.props.appAudio.midiLearn(this.props.id, "setGain");
    }
    
    setGain(value, midi) {
        if (midi) {
            value = linMap(value, 0, 127, this.MIN_GAIN, this.MAX_GAIN);
        }
        this.setState({ value });
        this.gainAudio.value = value;
    }

    render() {
        return <div className="gain">
            <Knob min={ this.MIN_GAIN } max={ this.MAX_GAIN } 
                value={this.state.value} 
                onChange={value => this.setGain(value)} 
                appAudio={ this.props.appAudio.midiLearn }
                id={ `${this.props.id}-gain` }
                />
        </div>
    }
}


export default Gain;
