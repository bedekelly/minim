import React from 'react';

import './Echo.css';

import Knob from 'Components/Knob';


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
        return <div className="echo">
                  <div className="echo-layout">
                    <Knob min={ 0 } max={ 0.8 }
                          value={ this.state.feedback } 
                          default={ 0.2 }
                          units="%"
                          scale={ 100 }
                          precision={ 0 }
                          label="Feedback"
                          appAudio={ this.props.appAudio }
                          id={ this.props.id + "-feedback" }
                          onChange={ value => this.setFeedback(value) }></Knob>
                    <div className="label flabel">Feedback</div>
                    <Knob min={ 0 } max={ 1 }
                          value={ this.state.time } 
                          default={ 0.3 }
                          label="Time"
                          units="s"
                          precision={ 2 }
                          appAudio={ this.props.appAudio }
                          id={ this.props.id + "-time" }
                          onChange={ value => this.setTime(value) }></Knob>
                    <div className="label tlabel">Time</div>
                    <Knob min={ 1000 } max={ 10000 }
                          value={ this.state.cutoff } 
                          default={ 10000 }
                          label="Cutoff"
                          units="kHz"
                          scale={ 0.001 }
                          precision={ 2 }
                          appAudio={ this.props.appAudio }
                          id={ this.props.id + "-cutoff" }
                          onChange={ value => this.setCutoff(value) }></Knob>
                    <div className="label clabel">Cutoff</div>
                  </div>
                </div>
    }
}