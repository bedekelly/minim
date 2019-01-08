import React from "react";
import uuid from "uuid4";

import './Filter.css';



class Filter extends React.Component {

    constructor(props) {
        super(props);
        const filter = this.props.node;
        const context = this.props.context;
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1000, context.currentTime);
        filter.Q.setValueAtTime(1.5, context.currentTime);
        filter.gain.setValueAtTime(3, context.currentTime);
    }

    frequencyChange(event) {
        const range = event.target;
        const context = this.props.context;
        this.props.node.frequency.setValueAtTime(range.value, context.currentTime);
    }

    render() {
        return <div className="filter" key={uuid()}>
            <input type="range" className="slider" min={50} max={10000}
                   onChange={event => this.frequencyChange(event)}/>
        </div>;
    }
}


export default Filter;
