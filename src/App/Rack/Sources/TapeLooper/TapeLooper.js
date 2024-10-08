import React from "react";

import './TapeLooper.css';
import Editor from './Editor';
import TapeComponents from './TapeComponents';
import DraggableAudioData from './DraggableAudioData';
import Knob from 'Components/Knob';
import { CutIcon } from "../../../../Icons";


const DOUBLE_CLICK_TIME = 600;  // milliseconds.


class TapeLooper extends React.Component {

    PLAYBACK_MIN = 0;
    PLAYBACK_MAX = 2;

    constructor(props) {
        super(props);
        this.audio = this.props.appAudio.sources[this.props.id];
        this.state = {
            zoomed: false,
            hasTape: false,
            lastTimeSkippedBackward: 0,
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

    componentDidUpdate(prevProps, prevState) {
        if (this.props.reloadPlayState !== prevProps.reloadPlayState) {
            const newPlaying = this.audio.playing;
            console.log("In TapeLooper.componentDidUpdate: ", { newPlaying });
            this.setState({ playing: this.audio.playing });
        }
    }

    onDragLeave(event) {
        this.setState({ zoomed: false });
        event.preventDefault();
    }

    async fileLoaded(encodedBuffer) {
        await this.audio.gotEncodedBuffer(encodedBuffer);
        this.setState({ hasTape: true });
        this.forceUpdate();
    }

    newFile(file) {
        const reader = new FileReader();
        reader.onloadend = () => this.fileLoaded(reader.result);
        try {
            reader.readAsArrayBuffer(file);
        } catch (e) {
            // Don't do anything if we've dragged something dumb on.
        }
        
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
    
    skipBackward() {
        const now = Date.now();
        console.log(now, this.state.lastTimeSkippedBackward);
        console.log(now - this.state.lastTimeSkippedBackward);
        if (now - this.state.lastTimeSkippedBackward < DOUBLE_CLICK_TIME) {
            // Skip to start of song.
            console.log("double click", { now, DOUBLE_CLICK_TIME })
            this.audio.skipToStartOfSong();
        } else {
            this.audio.skipToStartOfLoopOrSong();
        }
        
        this.setState({
            lastTimeSkippedBackward: now
        })
    }
    
    skipForward() {
        this.audio.skipToEndOfLoopOrSong();
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
                rewind={ () => this.skipBackward() }
                fastForward={ () => this.skipForward() }
               ></Editor>
    }
    
    speedKnob() {
        return <React.Fragment>
            <Knob min={ this.PLAYBACK_MIN } 
                max={ this.PLAYBACK_MAX } 
                precision={ 0 }
                value={ this.state.playbackRate }
                default={ 1 }
                label="Speed"
                units="%"
                scale={ 100 }
                id={ this.props.id + "-playback-speed" }
                onChange={ value => this.setPlaybackRate(value) }
                appAudio={ this.props.appAudio }>
            </Knob>
            <p className="speed-title">Speed</p>
        </React.Fragment>
    }
    
    dragFileLabel() {
        return <p className="drag-sounds-label">Drag sounds here!</p>
    }
    
    editorButton() {
        return <div className="button editor-button" onClick={() => this.openEditor()}>
            <CutIcon />
        </div>;
    }
    
    decorativeButtons() {
        return <div className="buttons">
            <div className="left"></div>
            <div className="middle"></div>
            <div className="right"></div>
        </div>
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
            { this.decorativeButtons() }
            { this.audio.buffer ? this.speedKnob() : this.dragFileLabel() }
            { this.audio.buffer ? this.editorButton() : null }
            <TapeComponents></TapeComponents>
            { this.state.editorOpen ? this.editor() : null}
            { this.audio.buffer ? <DraggableAudioData audio={this.audio} /> : null }
        </div>
    }
}

export default TapeLooper;