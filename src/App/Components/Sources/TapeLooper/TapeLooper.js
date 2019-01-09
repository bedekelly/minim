import React from "react";

import './TapeLooper.css';


class TapeLooper extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            zoomed: false,
            hasTape: false
        }
        this.audio = this.props.audioGraph.sources[this.props.id];
    }

    async stop() {
        this.props.sourceNode.stop();
    }

    onDragOver(event) {
        this.setState({ zoomed: true });
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

    setPlaybackRate(event, rate) {
        this.audio.setPlaybackRate(rate);
        event.stopPropagation();
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
{
            // <div className="speed-up" onClick={() => this.props.setPlaybackRate(this.props.playbackRate*1.005)}>>></div>
}

            <div className="small-reel">
                <div className="middle circle"></div>
                <div className="circle one"></div>
                <div className="circle two"></div>
                <div className="circle three"></div>
                <div className="circle four"></div>
                <div className="circle five"></div>
                <div className="circle six"></div>
                <div className="circle seven"></div>
                <div className="circle eight"></div>
                <div className="circle nine"></div>
            </div>
            <div className="big-reel">
                <div className="hole one"></div>
                <div className="hole two"></div>
                <div className="hole three"></div>
                <div className="middle-hole"></div>
            </div>

            <div className="tape-top"></div>
            <div className="tape-bottom"></div>

            {/*<div className="eject" onClick={ event => this.eject(event) }>⏏</div>*/}
        </div>
    }
}

export default TapeLooper;