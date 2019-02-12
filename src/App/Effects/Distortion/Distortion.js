import React from 'react';

import Knob from '../../Knob';

import './Distortion.css';

const STEP = 4;


export default class Distortion extends React.Component {

    constructor(props) {
        super(props);
        this.audio = props.appAudio.effects[props.id];
        this.state = { amount: this.audio.amount };
        this.noiseCanvasRef = React.createRef();
        this.animateNoise = this.animateNoise.bind(this);
        this.maxDistortion = this.audio.max;
    }

    setAmount(amount) {
        this.setState({ amount });
        this.audio.amount = amount;
    }

    componentDidMount() {
        this.canvas = this.noiseCanvasRef.current;
        const context = this.canvas.getContext("2d");
        this.time = 0;
        this.frameRequest = this.animateNoise(context);
    }

    componentWillUnmount() {
        window.cancelAnimationFrame(this.frameRequest);
    }

    animateNoise(context) {
        this.frameRequest = requestAnimationFrame(() => this.animateNoise(context));
        let imageData = context.createImageData(100, 100);
        let pixels = imageData.data;

        for (let i = 0; i < pixels.length; i += STEP) {
            var c = 7 + Math.sin(i/50000 + this.time/7);
            pixels[i] = pixels[i+1] = pixels[i+2] = 40 * Math.random() * c;
            pixels[i+3] = 255;
        }

        this.time += 1;
        context.putImageData(imageData, 0, 0);
    }

    render() {
        return <div className="distortion">
                 <canvas id="tv" style={ { opacity: 0.4 * this.state.amount/this.audio.max } } 
                  width={ 100 } height={ 100 } ref={ this.noiseCanvasRef }></canvas>
                 <Knob min={ 0 } max={ this.audio.max } 
                     value={this.state.amount}
                     default={ 0 }
                     appAudio={ this.props.appAudio }
                     id={ this.props.id + "-distortion" }
                     onChange={ amount => this.setAmount(amount) } precision={ 0 }/>
               </div>
    }
}
