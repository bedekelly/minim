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
        this.gainAudio = this.props.graph.effects[this.props.id];
        this.state = {
            value: this.gainAudio.value
        }
    }
    
    midiLearn() {
        console.log("MIDI learning...")
        this.props.graph.midiLearn(this.props.id, "setGain");
    }
    
    componentDidMount() {
        this.props.graph.components[this.props.id] = {
            setGain: value => this.setGain(value, "midi")
        }
    }
    
    componentWillUnmount() {
        this.props.graph.unregisterComponent(this.props.id);
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
                midiLearn={() => this.midiLearn()}
                />
        </div>
    }
}


export default Gain;
