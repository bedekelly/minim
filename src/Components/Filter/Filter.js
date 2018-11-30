import React from "react";
import uuid from "uuid4";

import './Filter.css';



class Filter extends React.Component {

    constructor(props) {
        super(props);
        const filter = props.context.createBiquadFilter();
        this.state = {filter};
        this.connect();
    }

    connect() {
        const filter = this.state.filter;
        const context = this.props.context;
        this.props.input.disconnect();
        this.props.input.connect(filter);
        filter.connect(context.destination);
        filter.type = "lowshelf";
        filter.frequency.setValueAtTime(1000, context.currentTime);
        filter.gain.setValueAtTime(25, context.currentTime);
    }

    frequencyChange(event) {
        const range = event.target;
        const audioCtx = this.props.context;
        this.state.filter.frequency.setValueAtTime(range.value, audioCtx.currentTime);
    }

    render() {
        return <div className="filter" key={uuid()}>
            <input type="range" className="slider" min={ 20 } max={ 20000 }
                   onChange={ event => this.frequencyChange(event) }/>
        </div>;
    }
}


export default Filter;
