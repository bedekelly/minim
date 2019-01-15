import React from "react";

import './Gain.css';
import Knob from '../../Knob/Knob';


class Gain extends React.Component {
    
    constructor(props) {
        super(props);
        this.gainAudio = this.props.graph.effects[this.props.id];
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
            <Knob min={0} max={5} 
                value={this.state.value} 
                onChange={value => this.setGain(value)} 
                />
        </div>
    }
}


export default Gain;
