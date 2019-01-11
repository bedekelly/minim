import React from "react";

import './Filter.css';



class Filter extends React.Component {
    
    constructor(props) {
        super(props);
        this.filterAudio = this.props.graph.effects[this.props.id];
        this.state = {
            value: this.filterAudio.value
        }
    }

    frequencyChange(event) {
        this.filterAudio.value = event.target.value;
        this.setState({value: event.target.value})
    }

    render() {
        return <div className="filter">
            <input type="range" className="slider" min={50} max={5000}
                   value={this.state.value}
                   onChange={event => this.frequencyChange(event)}/>
        </div>;
    }
}


export default Filter;
