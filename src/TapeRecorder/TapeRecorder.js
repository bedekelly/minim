import React from "react";

import './TapeRecorder.css';


class TapeRecorder extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            playing: false,
            hasTape: false,
            zoomed: false
        };
        this.togglePlaying = this.togglePlaying.bind(this);
        this.onDragOver = this.onDragOver.bind(this);
        this.onDrop = this.onDrop.bind(this);
        this.onDragLeave = this.onDragLeave.bind(this);
        this.eject = this.eject.bind(this);
    }

    togglePlaying() {
        if (this.state.playing || !this.state.hasTape) {
            this.setState({ playing: false });
        } else {
            this.setState({ playing: true });
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

    onDrop(event) {
        this.setState({ zoomed: false, hasTape: true });
        event.preventDefault();
    }

    eject(event) {
        this.setState({ hasTape: false, playing: false });
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
            onClick={ this.togglePlaying }
            onDragOver={ this.onDragOver }
            onDragLeave={ this.onDragLeave }
            onDrop={ this.onDrop }
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

            <div className="eject" onClick={ this.eject }>⏏</div>
        </div>
    }
}

export default TapeRecorder;