import React from 'react';
import './Rice.css';

import Knob from '../../Knob';
import WaveformDisplay from './WaveformDisplay';


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
        this.audio = this.props.appAudio.sources[this.props.id];
    }
    
    onDrop(event) {
        let file = event.dataTransfer.files[0];
        this.newFile(file);
        event.preventDefault();
    }

    async fileLoaded(encodedBuffer) {
        await this.audio.gotEncodedBuffer(encodedBuffer);
        this.setState({ audioId: this.audio.audioId });
    }

    newFile(file) {
        const reader = new FileReader();
        reader.onloadend = () => this.fileLoaded(reader.result);
        reader.readAsArrayBuffer(file);
    }

    onDragOver(event) {
        event.preventDefault();
    }

    render() {
        return <div className="rice" onDrop={ event => this.onDrop(event) } onDragOver={ event => this.onDragOver(event)}>
          <div className="waveform">
              { this.audio.buffer 
                  ? <WaveformDisplay width={ 240 } height={ 75 } buffer={ this.audio.buffer } audioId={ this.audio.audioId }/>
                  : <div className="empty-waveform"></div>
              }
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
