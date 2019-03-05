import React from "react";

import Slider from 'Components/Slider';

import './HighPassFilter.css';



class HighPassFilter extends React.Component {
    
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
        return <div className="hi-filter">
            <Slider min={ 50 } max={ 6000 }
                value={ this.state.value }
                onChange={ value => this.frequencyChange(value) }
                appAudio={ this.props.appAudio }
                id={ this.props.id + "-frequency" }
                units="kHz"
                label="Cut"
                scale={ 0.001 }
                precision={ 2 }
                default={ 2500 }
                ></Slider>
        </div>;
    }
}


export default HighPassFilter;
