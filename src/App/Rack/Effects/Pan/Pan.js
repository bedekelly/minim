import React from "react";
import './Pan.css';

import Slider from 'Components/Slider';


class Pan extends React.Component {
    
    constructor(props) {
        super(props);
        this.panAudio = this.props.appAudio.effects[this.props.id];
        this.state = {
            value: this.panAudio.value
        }
    }
    
    onChange(value) {
        this.panAudio.value = value;
        this.setState({value: value});
    }

    render() {
        return <div className="pan">
            <Slider min={ -1 } max={ 1 } step={ 0.01 }
                value={ this.state.value }
                default={ 0 }
                label="Pan"
                onChange={ value => this.onChange(value) }
                appAudio={ this.props.appAudio }
                id={ this.props.id + "-pan" }
                ></Slider>
        </div>
    }
}


export default Pan;