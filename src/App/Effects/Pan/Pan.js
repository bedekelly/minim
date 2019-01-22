import React from "react";
import './Pan.css';


class Pan extends React.Component {
    
    constructor(props) {
        super(props);
        this.panAudio = this.props.appAudio.effects[this.props.id];
        this.state = {
            value: this.panAudio.value
        }
    }
    
    onChange(event) {
        const newPan = event.target.valueAsNumber;
        this.panAudio.value = newPan;
        this.setState({value: newPan});
    }

    render() {
        return <div className="pan">
            <input type="range" min={-1} max={1} step={0.01} value={this.state.value} onChange={event=>this.onChange(event)}/>
        </div>
    }
}


export default Pan;