import React from 'react';
import './Rice.css';

import Knob from '../../Knob';


export default class Rice extends React.Component {
    
    MIN_SPACE = 0.1
    MAX_SPACE = 100
    
    MIN_LENGTH = 0.1
    MAX_LENGTH = 100

    constructor(props) {
        super(props);
        this.state = {
            length: 50,
            space: 50
        }
    }

    render() {
        return <div className="rice">
          <div className="waveform">
            <div className="wave"></div>
          </div>
          <div className="randomise control">
            <button></button>
            <span>Random</span>
          </div>
          <div className="length control">
            <Knob
             min={ this.MIN_LENGTH }
             max={ this.MAX_LENGTH }
             value={ this.state.length }
             onChange={ length => this.setState({ length }) }
            />
            <span>Length</span>
          </div>
          <div className="space control">
            <Knob
             min={ this.MIN_SPACE }
             max={ this.MAX_SPACE }
             value={ this.state.space }
             onChange={ space => this.setState({ space }) }
            />
            <span>Space</span>
          </div>
        </div>
    }
}
