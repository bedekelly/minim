import React from 'react';

import './Echo.css';

import Knob from '../../Knob';


export default class Echo extends React.Component {

    constructor(props) {
        super(props);
        this.audio = props.appAudio.effects[props.id];
        this.state = {
            cutoff: this.audio.cutoff,
            time: this.audio.time,
            feedback: this.audio.feedback
        };
    }

    setFeedback(feedback) {
        this.audio.feedback = feedback;
        this.setState({ feedback });
    }

    setTime(time) {
        this.audio.time = time;
        this.setState({ time });
    }

    setCutoff(cutoff) {
        this.audio.cutoff = cutoff;
        this.setState({ cutoff });
    }
    
    render() {
        return <div class="echo">
                  <div class="echo-layout">
                    <Knob min={ 0 } max={ 1 }
                          value={ this.state.feedback } 
                          appAudio={ this.props.appAudio }
                          id={ this.props.id + "-feedback" }
                          onChange={ value => this.setFeedback(value) }></Knob>
                    <div class="label flabel">Feedback</div>
                    <Knob min={ 0 } max={ 1 }
                          value={ this.state.time } 
                          appAudio={ this.props.appAudio }
                          id={ this.props.id + "-time" }
                          onChange={ value => this.setTime(value) }></Knob>
                    <div class="label tlabel">Time</div>
                    <Knob min={ 1000 } max={ 10000 }
                          value={ this.state.cutoff } 
                          appAudio={ this.props.appAudio }
                          id={ this.props.id + "-cutoff" }
                          onChange={ value => this.setCutoff(value) }></Knob>
                    <div class="label clabel">Cutoff</div>
                  </div>
                </div>
    }
}