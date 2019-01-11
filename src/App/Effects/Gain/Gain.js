import React from "react";

import './Gain.css';



class Gain extends React.Component {
    
    constructor(props) {
        super(props);
        this.gainAudio = this.props.graph.effects[this.props.id];
        this.state = {
            value: this.gainAudio.value
        }
        console.log(this.state);
    }
    
    setGain(value) {
        this.gainAudio.value = value;
        this.setState({ value });
    }

    render() {
        return <div className="gain">
            <input type="range" className="slider" min={0} max={2} step={0.01}
                   value={this.state.value}
                   onChange={event => this.setGain(event.target.value)}/>
        </div>;
    }
}


export default Gain;
