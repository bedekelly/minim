import React from 'react';
import './GranularSynth.css';

import Knob from '../../Knob';
import WaveformDisplay from './WaveformDisplay';


export default class GranularSynth extends React.Component {

    MIN_LENGTH = 0.03
    MAX_LENGTH = 0.5
    
    MIN_SPACE = -0.8
    MAX_SPACE = 0.5
    
    constructor(props) {
        super(props);
        this.audio = this.props.appAudio.sources[this.props.id];
        this.state = {
            length: this.audio.length,
            space: this.audio.spacing / this.audio.length
        }
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

    componentDidMount() {
        this.props.appAudio.registerComponent(this.props.id, {
            setLength: value => this.setLength(value, "midi"),
            setSpace: value => this.setSpace(value, "midi")
        });
    }

    midiLearn(control) {
        this.props.appAudio.midiLearn(this.props.id, control);
    }
    
    setLength(length) {
        this.audio.setLength(length);
        this.setState({ length });
    }
    
    setSpace(space) {
        this.audio.setSpace(space);
        this.setState({ space });
    }

    render() {
        return <div className="rice" onDrop={ event => this.onDrop(event) } onDragOver={ event => this.onDragOver(event)}>
          <div className="waveform" onClick={ () => this.audio.randomise() }>
              { this.audio.buffer 
                  ? <WaveformDisplay width={ 240 } height={ 75 } buffer={ this.audio.buffer } audioId={ this.audio.audioId }/>
                  : <div className="empty-waveform">Drag a sound file here!</div>
              }
          </div>
          <div className="randomise control">
            <button onClick={ () => this.audio.noteOn() }></button>
            <span>Play</span>
          </div>
          <div className="length control">
            <Knob
             min={ this.MIN_LENGTH }
             max={ this.MAX_LENGTH }
             value={ this.state.length }
             onChange={ length => this.setLength(length) }
             midiLearn={ () => this.midiLearn("setLength") }
            />
            <span>Length</span>
          </div>
          <div className="space control">
            <Knob
             min={ this.MIN_SPACE }
             max={ this.MAX_SPACE }
             value={ this.state.space }
             onChange={ space => this.setSpace(space) }
             midiLearn={ () => this.midiLearn("setSpace") }
            />
            <span>Space</span>
          </div>
        </div>
    }
}
