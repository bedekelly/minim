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

    async lightPad(index, lit) {
        const pads = this.state.pads.map((p, i) => {
            if (i === index) {
                return { ...p, lit }
            } else return p;
        })
        console.log("Before:")
        console.log(this.state);
        await this.setState({ pads })
        console.log("After:")
        console.log(this.state);
    }

    fileLoaded(encodedBuffer, index) {
        this.setState({ hasTape: true });
        return this.audio.loadBufferToPad(encodedBuffer, index);
    }

    newFile(file, index) {
        const reader = new FileReader();
        reader.onloadend = () => this.fileLoaded(reader.result, index);
        reader.readAsArrayBuffer(file);
    }

    onDrop(event, index) {
        event.preventDefault()
        let file = event.dataTransfer.files[0];
        this.newFile(file, index);
    }

    showPad(pad, index) {
        const className = `pad ${pad.lit ? "lit" : ""}`
        return <button 
                onMouseDown={ () => this.playPad(index) }
                onDragOver={ event => event.preventDefault() }
                onDragLeave={ event => event.preventDefault() }
                onDrop={ event => this.onDrop(event, index) }
                className={ className }
                key={ index }
               ></button>;
    }

    render() {
        return <div className="mpc">
            { this.state.pads.map((pad, index) => this.showPad(pad, index)) }
        </div>
    }
}


export default MPC;