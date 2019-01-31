import React from 'react';

import Knob from '../../Knob';

import './Distortion.css';

const STEP = 4;


export default class Distortion extends React.Component {
    constructor(props) {
        super(props);
        this.state = { amount: 0 };
        this.noiseCanvasRef = React.createRef();
        this.animateNoise = this.animateNoise.bind(this);
    }

    setAmount(amount) {
        this.setState({ amount });
    }

    componentDidMount() {
        this.canvas = this.noiseCanvasRef.current;
        const context = this.canvas.getContext("2d");
        this.time = 0;
        this.animateNoise(context);
    }

    animateNoise(context) {
        let imageData = context.createImageData(100, 100);
        let pixels = imageData.data;

        for (let i = 0; i < pixels.length; i += STEP) {
            var c = 7 + Math.sin(i/50000 + this.time/7);
            pixels[i] = pixels[i+1] = pixels[i+2] = 40 * Math.random() * c;
            pixels[i+3] = 255;
        }

        this.time += 1;
        context.putImageData(imageData, 0, 0);
        requestAnimationFrame(() => this.animateNoise(context));
    }

    render() {
        return <div className="distortion">
                 <canvas id="tv" style={ { opacity: this.state.amount*0.4 } } 
                  width={ 100 } height={ 100 } ref={ this.noiseCanvasRef }></canvas>
                 <Knob min={0} max={1} value={this.state.amount}
                       onChange={ amount => this.setAmount(amount) } />
               </div>
    }
}
