import React from "react";
import './Pan.css';


class Pan extends React.Component {
    
    constructor(props) {
        super(props);
        this.panAudio = this.props.graph.effects[this.props.id];
    }
    
    onChange(event) {
        const newPan = (event.target.valueAsNumber / 50) - 1;
        this.panAudio.setValue(newPan);
    }

    render() {
        return <div className="pan">
            <input type="range" min={0} max={100} step={1} onChange={event=>this.onChange(event)}/>
        </div>
    }
}


export default Pan;