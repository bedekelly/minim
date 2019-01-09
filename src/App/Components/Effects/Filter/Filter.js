import React from "react";

import './Filter.css';



class Filter extends React.Component {
    
    constructor(props) {
        super(props);
        this.filterAudio = this.props.graph.effects[this.props.id];
    }
    
    frequencyChange(event) {
        this.filterAudio.setValue(event.target.value);
    }

    render() {
        return <div className="filter">
            <input type="range" className="slider" min={50} max={10000}
                   onChange={event => this.frequencyChange(event)}/>
        </div>;
    }
}


export default Filter;
