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
            playing: false,
            looping: true,
            playbackRate: this.audio.playbackRate
        }
    }

    async stop() {
        // this.audio.stop();
        this.setState({ playing: false });
    }

    onDragOver(event) {
        event.preventDefault();
    }

    componentDidUpdate(prevProps) {
        if (this.props.playing !== prevProps.playing) {
            this.setState({ playing: this.props.playing })
        }
    }

    onDragLeave(event) {
        this.setState({ zoomed: false });
        event.preventDefault();
    }

    async fileLoaded(encodedBuffer) {
        await this.audio.gotEncodedBuffer(encodedBuffer);
        this.setState({ hasTape: true });
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
    
    play() {
        this.audio.play();
        this.setState({ playing: true });
    }
    
    pause() {
        this.audio.pause();
        this.setState({ playing: false });
    }
    
    toggleLoop() {
        this.audio.toggleLooping();
        this.setState({ looping: !this.state.looping });
    }
    
    componentDidMount() {
        this.audio.stopGraphics = () => {
            this.stop();
        }
    }
    
    editor() {
        return <Editor 
                close={() => this.closeEditor()} 
                audio={this.audio}
                playing={ this.state.playing }
                looping={ this.state.looping }
                play={ () => this.play() }
                pause={ () => this.pause()}
                toggleLoop={ () => this.toggleLoop() }
                rewind={ () => console.log("Rewind") }
                fastForward={ () => console.log("Fast-forward") }
               ></Editor>
    }
    
    render() {
        const classNames = [
            "tape-looper",
            this.state.hasTape ? "has-tape" : ' ',
            this.state.playing ? "playing" : ' ',
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
                precision={ 2 }
                value={ this.state.playbackRate }
                default={ 1 }
                id={ this.props.id + "-playback-speed" }
                onChange={ value => this.setPlaybackRate(value) }
                appAudio={ this.props.appAudio }>
            </Knob>
            <p className="speed-title">Speed</p>
            { this.audio.buffer ? <div className="button editor-button" onClick={() => this.openEditor()}>~</div> : null }
            <TapeComponents></TapeComponents>
            { this.state.editorOpen ? this.editor() : null}
        </div>
    }
}

export default TapeLooper;