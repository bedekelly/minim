import React from "react";

import './TapeRecorder.css';


class TapeRecorder extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            playing: false,
            hasTape: false,
            zoomed: false,
            buffer: null,
            source: null
        };
    }

    async playAudio() {
        if (this.state.source) {
            this.props.context.resume();
        } else {
            const source = await this.props.makeSource();
            source.buffer = this.state.buffer;
            source.connect(this.props.context.destination);
            source.start(0);
            return this.setState({...this.state, source})
        }
    }

    pauseAudio() {
        this.state.source && this.props.context.suspend();
    }

    async togglePlaying() {
        if (this.state.playing || !this.state.hasTape) {
            await this.setState({ playing: false });
            await this.pauseAudio();
        } else {
            await this.setState({ playing: true });
            await this.playAudio();
        }
    }

    onDragOver(event) {
        this.setState({ zoomed: true });
        event.preventDefault();
    }

    onDragLeave(event) {
        this.setState({ zoomed: false });
        event.preventDefault();
    }

    async fileLoaded(arrayBuffer) {
        const p = new Promise();
        
        this.setState({...this.state, buffer: await this.props.context.decodeAudioData(arrayBuffer)});
    }

    newFile(file) {
        const reader = new FileReader();
        reader.onloadend = () => this.fileLoaded(reader.result);
        reader.readAsArrayBuffer(file);
    }

    onDrop(event) {
        let file = event.dataTransfer.files[0];
        // If dropped items aren't files, reject them
        this.newFile(file);
        this.setState({ zoomed: false, hasTape: true });
        event.preventDefault();
    }

    eject(event) {
        this.setState({ hasTape: false, playing: false, source: null });
        event.stopPropagation();
    }

    render() {
        const classNames = [
            "tape-player",
            this.state.hasTape ? "has-tape" : ' ',
            this.state.playing ? "playing" : ' ',
            this.state.zoomed ? "zoomed" : ' '
        ].join(" ");

        return <div
            className={ classNames }
            onClick={ event => this.togglePlaying(event) }
            onDragOver={ event => this.onDragOver(event) }
            onDragLeave={ event => this.onDragLeave(event) }
            onDrop={ event => this.onDrop(event) }
        >
            <div className="buttons">
                <div className="left"></div>
                <div className="middle"></div>
                <div className="right"></div>
            </div>

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

            <div className="eject" onClick={ event => this.eject(event) }>⏏</div>
        </div>
    }
}

export default TapeRecorder;