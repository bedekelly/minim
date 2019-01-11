import React from "react";
import './Pan.css';


class Pan extends React.Component {
    
    constructor(props) {
        super(props);
        this.panAudio = this.props.graph.effects[this.props.id];
        this.state = {
            value: this.panAudio.sliderValue
        }
    }
    
    onChange(event) {
        const newPan = event.target.valueAsNumber;
        this.panAudio.setValue(newPan);
        this.setState({value: newPan});
    }

    render() {
        return <div className="pan">
            <input type="range" min={0} max={100} step={1} value={this.state.value} onChange={event=>this.onChange(event)}/>
        </div>
    }
}


export default Pan;