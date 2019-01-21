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
            length: 0,
            space: 0
        }
    }

    render() {
        return <div class="rice">
          <div class="waveform">
            <div class="wave"></div>
          </div>
          <div class="randomise control">
            <button></button>
            <span>Random</span>
          </div>
          <div class="length control">
            <Knob></Knob>
            <span>Length</span>
          </div>
          <div class="space control">
            <div class="knob"></div>
            <span>Space</span>
          </div>
        </div>
    }
}
