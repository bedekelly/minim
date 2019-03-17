import React from 'react';

import './MPC.css';


class MPC extends React.Component {
    
    constructor(props) {
        super(props);
        this.audio = props.appAudio.sources[props.id];
        this.audio.lightPad = this.lightPad.bind(this);
        this.state = { pads: this.audio.pads };
    }

    playPad(index) {
        this.audio.playPad(index);
    }

    lightPad(index, lit) {
        const pads = this.state.pads.map((p, i) => {
            if (i === index) {
                return { ...p, lit }
            } else return p;
        });
        this.setState({ pads })
    }

    fileLoaded(encodedBuffer, index) {
        return this.audio.loadBufferToPad(encodedBuffer, index);
    }

    newFile(file, index) {
        const reader = new FileReader();
        reader.onloadend = () => this.fileLoaded(reader.result, index);
        reader.readAsArrayBuffer(file);
    }

    onDrop(event, index) {
        event.preventDefault();
        const { files } = event.dataTransfer;
        if (files.length === 0) {
            const id = event.dataTransfer.getData("id");
            const data = window.audioData[id];
            this.audio.loadFromTapeLooper(data, index);
        } else {
            for (let file of files) {
                this.newFile(file, index);
                console.log("Loading file to index " + index);
                if (--index < 0) break;
            }
        }
    }

    showPad(pad, index) {
        const className = `pad ${pad.lit ? "lit" : ""}`;
        return <button
            onMouseDown={() => this.playPad(index)}
            onDragOver={event => event.preventDefault()}
            onDragLeave={event => event.preventDefault()}
            onDrop={event => this.onDrop(event, index)}
            className={className}
            key={index}
        />;
    }

    render() {
        return <div className="mpc">
            { this.state.pads.map((pad, index) => this.showPad(pad, index)) }
        </div>
    }
}


export default MPC;