import React from 'react';
import Knob from '../../Knob';

import './BitCrusher.css';


/**
 * Linearly map a value from one range to another.
 */
function linMap(value, fromLower, fromUpper, toLower, toUpper) {
    const lowerRange = fromUpper - fromLower;
    const upperRange = toUpper - toLower;
    const magnitudeThroughLowerRange = (value - fromLower);
    const fractionThroughRange = magnitudeThroughLowerRange / lowerRange;
    const magnitudeThroughUpperRange = fractionThroughRange * upperRange;
    const valueInUpperRange = toLower + magnitudeThroughUpperRange;
    return valueInUpperRange;
}


const maxStep = 25;


export default class BitCrusher extends React.Component {
    
    constructor(props) {
        super(props);
        this.audio = this.props.appAudio.effects[this.props.id];
        this.state = {
            bitDepth: this.audio.bitDepth,
            frequencyReduction: this.audio.frequencyReduction
        }
        this.backgroundRef = React.createRef();
    }
    
    changeBitDepth(bitDepth) {
        this.audio.bitDepth = bitDepth;
        this.setState({ bitDepth });
    }
    
    changeFrequencyReduction(frequencyReduction) {
        this.audio.frequencyReduction = frequencyReduction;
        this.setState({ frequencyReduction });
    }
    
    renderFrame(t) {
        const context = this.canvasContext.putImageData ? this.canvasContext : this.updateContext();
        const canvas = this.canvas;
        const { width, height } = canvas;
        const imageData = context.createImageData(canvas.width, canvas.height);
        const pixels = imageData.data;
        
        const vStep = maxStep - Math.round(linMap(this.state.frequencyReduction, 0, 1, 0, maxStep-1));
        const hStep = vStep;
      
        for (let row=0; row<height; row++) {
          let y = (vStep * (Math.round(row / vStep))) / height;
          for (let col=0; col<width; col++) {
            let x = hStep * (Math.round(col / hStep)) / width;
            let p = 4 * (row * width + col);
            
            const r = 50 + 50 * (1 + Math.tan(-t/2000 + x + y - 100));
            const g = 90 + (row) % 128;
            const b = 128 * (1 + Math.sin(x/width));
            
            pixels[p] = r;
            pixels[p+1] = g;
            pixels[p+2] = b;
            pixels[p+3] = 255;
          }
        }
        context.putImageData(imageData, 0, 0);
        this.frameRequest = requestAnimationFrame(timestamp => this.renderFrame(timestamp));
    }
    
    updateContext() {
        this.canvas = this.backgroundRef.current;
        this.canvasContext = this.backgroundRef.current.getContext("2d");
    }
    
    componentDidMount() {
        this.updateContext();
        this.frameRequest = requestAnimationFrame(timestamp => this.renderFrame(timestamp));
    }
    
    componentWillUnmount() {
        window.cancelAnimationFrame(this.frameRequest);
    }
    
    canvasStyle() {
        const grey = linMap(this.state.bitDepth, 1, 16, 1, 0);
        return {
            filter: `grayscale(${grey})`
        }
    }
    
    render() {
        return <div className="bit-crusher">
            <canvas width={ 200 } height={ 100 } 
                    ref={ this.backgroundRef }
                    style={ this.canvasStyle() }></canvas>
            <Knob min={1} max={16} 
                value={ this.state.bitDepth }
                default={ 12 }
                id={ this.props.id + "-bit-depth" }
                appAudio={ this.audio.appAudio }
                onChange={ value => this.changeBitDepth(value) }
                />
            <div className="bit-depth-label">
                <span className="label">Bit Depth</span>
            </div>
            
            <Knob min={0} max={1} 
                value={ this.state.frequencyReduction }
                default={ 0.5 }
                id={ this.props.id + "-frequency-reduction"}
                appAudio={ this.audio.appAudio }
                onChange={ value => this.changeFrequencyReduction(value) }
                />
            <div className="freq-label">
                <span className="label">Frequency</span>
            </div>
        </div>
    }
}