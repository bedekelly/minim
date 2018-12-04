import React from "react";
import './Pan.css';


class Pan extends React.Component {

    onChange(event) {
        const newPan = (event.target.valueAsNumber / 50) - 1;
        const context = this.props.context;
        this.props.node.pan.setValueAtTime(newPan, context.currentTime);
    }

    render() {
        return <div className="pan">
            <input type="range" min={0} max={100} step={1} onChange={event=>this.onChange(event)}/>
        </div>
    }
}


export default Pan;