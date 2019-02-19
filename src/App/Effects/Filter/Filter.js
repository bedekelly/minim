import React from "react";

import Slider from '../../Slider';

import './Filter.css';



class Filter extends React.Component {
    
    constructor(props) {
        super(props);
        this.filterAudio = this.props.appAudio.effects[this.props.id];
        this.state = {
            value: this.filterAudio.value
        }
    }

    frequencyChange(value) {
        this.filterAudio.value = value;
        this.setState({ value })
    }

    render() {
        return <div className="filter">
            <Slider min={ 50 } max={ 5000 }
                value={ this.state.value }
                onChange={ value => this.frequencyChange(value) }
                appAudio={ this.props.appAudio }
                units="kHz"
                label="Cut"
                default={ 2500 }
                scale={ 0.001 }
                precision={ 2 }
                id={ this.props.id + "-frequency" }
                ></Slider>
        </div>;
    }
}


export default Filter;
