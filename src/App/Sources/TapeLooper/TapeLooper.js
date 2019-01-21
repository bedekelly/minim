import React from "react";

import './TapeLooper.css';
import Editor from '../../Editor/Editor.js';
import TapeComponents from './TapeComponents';
import Knob from '../../Knob';

class TapeLooper extends React.Component {

    PLAYBACK_MIN = 0;
    PLAYBACK_MAX = 2;

    constructor(props) {
        super(props);
        this.audio = this.props.appAudio.sources[this.props.id];
        this.state = {
            zoomed: false,
            hasTape: false,
            playbackRate: this.audio.playbackRate
        }
        
    }

    async stop() {
        this.props.sourceNode.stop();
    }

    onDragOver(event) {
        // this.setState({ zoomed: true });
        event.preventDefault();
    }

    onDragLeave(event) {
        this.setState({ zoomed: false });
        event.preventDefault();
    }

    fileLoaded(encodedBuffer) {
        this.setState({ hasTape: true });
        return this.audio.gotEncodedBuffer(encodedBuffer);
    }

    newFile(file) {
        const reader = new FileReader();
        reader.onloadend = () => this.fileLoaded(reader.result);
        reader.readAsArrayBuffer(file);
    }

    onDrop(event) {
        let file = event.dataTransfer.files[0];
        this.newFile(file);
        event.preventDefault();
    }
    
    get playbackRate() {
        return this.state.playbackRate;
    }
    
    setPlaybackRate(rate) {
        this.audio.setPlaybackRate(rate);
        this.setState({ playbackRate: rate });
    }
    
    openEditor() {
        this.setState({editorOpen: true});
    }
    
    closeEditor() {
        this.setState({editorOpen: false});
    }
    
    editor() {
        return <Editor close={() => this.closeEditor()} audio={this.audio}></Editor>
    }

    render() {
        const classNames = [
            "tape-looper",
            this.state.hasTape ? "has-tape" : ' ',
            this.props.playing ? "playing" : ' ',
            this.state.zoomed ? "zoomed" : ' '
        ].join(" ");

        return <div
            className={ classNames }
            onDragOver={ event => this.onDragOver(event) }
            onDragLeave={ event => this.onDragLeave(event) }
            onDrop={ event => this.onDrop(event) }
        >
            <div className="buttons">
                <div className="left"></div>
                <div className="middle"></div>
                <div className="right"></div>
            </div>

            <Knob 
                min={ this.PLAYBACK_MIN } 
                max={ this.PLAYBACK_MAX } 
                value={ this.state.playbackRate }
                onChange={ value => this.setPlaybackRate(value) }
                midiLearn={ () => this.midiLearn() }>
            </Knob>
            <p className="speed-title">Speed</p>
            { this.state.hasTape ? <div className="button editor-button" onClick={() => this.openEditor()}>~</div> : null }

            <TapeComponents></TapeComponents>
            
            { this.state.editorOpen ? this.editor() : null}
        </div>
    }
}

export default TapeLooper;