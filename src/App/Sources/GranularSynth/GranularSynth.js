import React from 'react';
import './GranularSynth.css';

import Knob from 'Components/Knob';
import WaveformDisplay from './WaveformDisplay';


export default class GranularSynth extends React.Component {

    MIN_LENGTH = 0.01;
    MAX_LENGTH = 0.1;
    DEFAULT_LENGTH = 0.05;

    MIN_SPACE = -0.8;
    MAX_SPACE = 0.2;
    DEFAULT_SPACE = -0.1;

    constructor(props) {
        super(props);
        this.audio = this.props.appAudio.sources[this.props.id];
        this.state = {
            length: this.audio.grainLength,
            space: this.audio.grainOverlap,
            grainPosition: this.audio.grainPosition,
            spray: this.audio.spray
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

    setLength(length) {
        this.audio.grainLength = length;
        this.setState({ length });
    }
    
    setSpace(space) {
        this.audio.setOverlap(space);
        this.setState({ space });
    }
    
    setSpray(spray) {
        this.audio.spray = spray;
        this.setState({ spray });
    }
    
    selectGrain(grainPosition) {
        this.audio.setPosition(grainPosition);
        this.setState({ grainPosition });
    }

    positionIndicatorStyle() {
        return {
            left: 10 + 240 * this.state.grainPosition
        };
    }

    render() {
        return <div className="rice" onDrop={ event => this.onDrop(event) } onDragOver={ event => this.onDragOver(event)}>
          <div className="waveform">
              { this.audio.buffer 
                  ? <React.Fragment>
                      <div className="position-indicator" style={ this.positionIndicatorStyle() }></div>
                      <WaveformDisplay selectGrain={ grain => this.selectGrain(grain) } width={ 240 } height={ 75 } buffer={ this.audio.buffer } audioId={ this.audio.audioId }/>
                    </React.Fragment>: <div className="empty-waveform">Drag a sound file here!</div>
              }
          </div>
          <div className="spray control">
              <Knob
               min={ 0 }
               max={ 100 }
               value={ this.state.spray }
               default={ 6 }
               label="Spray"
               precision={ 0 }
               units="%"
               appAudio={ this.props.appAudio }
               id={ this.props.id + "-spray" }
               onChange={ spray => this.setSpray(spray) }
              />
              <span>Spray</span>
          </div>
          <div className="length control">
            <Knob
             min={ this.MIN_LENGTH }
             max={ this.MAX_LENGTH }
             value={ this.state.length }
             default={ this.DEFAULT_LENGTH }
             label="Length"
             units="ms"
             precision={ 0 }
             scale={ 1000 }
             appAudio={ this.props.appAudio }
             id={ this.props.id + "-length" }
             onChange={ length => this.setLength(length) }
            />
            <span>Length</span>
          </div>
          <div className="space control">
            <Knob
             min={ this.MIN_SPACE }
             max={ this.MAX_SPACE }
             value={ this.state.space }
             default={ this.DEFAULT_SPACE }
             label="Spacing"
             units="%"
             precision={ 0 }
             scale={ 100 }
             id={ this.props.id + "-spacing" }
             appAudio={ this.props.appAudio }
             onChange={ space => this.setSpace(space) }
            />
            <span>Space</span>
          </div>
        </div>
    }
}
