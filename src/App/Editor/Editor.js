import React from 'react';

import './Editor.css';


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


class Editor extends React.Component {
    
    constructor(props) {
        super(props);
        this.audio = props.audio;
        this.canvasRef = React.createRef();
        this.state = { ready: false };
        this.nextAnimationId = null;
    }
    
    componentDidMount() {
        this.context = this.canvasRef.current.getContext("2d");
        this.canvasWidth = this.canvasRef.current.width;
        this.canvasHeight = this.canvasRef.current.height;
        
        // These calls block the main thread :(
        this.renderWaveformToCanvas();
        this.animatePlayHead();
    }
    
    animatePlayHead() {
        const that = this;
        const { audio, context, waveformImage } = this;
        const canvas = this.canvasRef.current;
        const { width, height } = canvas;

        const triangleBase = 5;
        const triangleHeight = 7;

        function animate() {
            const x = linMap(audio.relativeCurrentTime, 0, audio.duration, 0, width);
            context.clearRect(0, 0, width, height);
            context.putImageData(waveformImage, 0, 0);
            context.strokeStyle = "green";
            context.lineWidth = "1px";

            context.beginPath()
            
            // Top triangle:
            context.moveTo(x-triangleBase/2, 0);
            context.lineTo(x, triangleHeight);
            context.lineTo(x+triangleBase/2, 0);
            context.lineTo(x-triangleBase/2, 0);
            context.moveTo(x, triangleHeight);
            
            // Main play line:
            context.lineTo(x, height-triangleHeight);
            
            // Bottom triangle:
            context.lineTo(x-triangleBase/2, height);
            context.lineTo(x+triangleBase/2, height);
            context.lineTo(x, height-triangleHeight);
            
            // Draw and request animation callback.
            context.stroke();
            context.fill();
            that.nextAnimationId = requestAnimationFrame(animate);
        }
        
        this.nextAnimationId = requestAnimationFrame(animate);
    }
    
    // Return a buffer's min and max values, and a resampled buffer.
    static analyse(buffer, resampleLength) {
        const resampledBuffer = new Float32Array(resampleLength);
        let min = 100;
        let max = -100;
        let resampledMin = 100;
        let resampledMax = -100;
        
        const bucketSize = 1 + Math.ceil(buffer.length / resampleLength);

        let bucketTotal = 0;
        let bucketMax = 0;

        for (let i = 0; i < buffer.length; i++) {
            if (buffer[i] < min) min = buffer[i];
            else if (buffer[i] > max) max = buffer[i];
            bucketTotal += buffer[i];
            if (Math.abs(buffer[i]) > Math.abs(bucketMax)) bucketMax = buffer[i];

            if (i % bucketSize === 0) {
                const usingMean = true;
                const value = usingMean ? bucketTotal / bucketSize : bucketMax;
                resampledBuffer[i/bucketSize] = value;
                if (value < resampledMin) resampledMin = value;
                else if (value > resampledMax) resampledMax = value;
                
                // Reset running bucket totals.
                bucketTotal = 0;
                bucketMax = 0;
            }
        }
        return { resampledBuffer, min, max, resampledMin, resampledMax };
    }

    renderWaveformToCanvas() {
        const width = this.canvasWidth;
        const height = this.canvasHeight;
        const leftChannel = this.audio.buffer.getChannelData(0);
        const { resampledMin, resampledMax, resampledBuffer } = Editor.analyse(leftChannel, width);
        const context = this.context;
        const minY = this.canvasHeight;
        const maxY = 0;
        
        // Try to fix anti-aliasing.
        context.translate(0.5, 0.5);

        context.beginPath();
        const middleY = this.canvasHeight / 2;
        context.moveTo(0, middleY);

        for (let x=0; x<width; x++) {
            let value = resampledBuffer[x];
            let y = linMap(value, resampledMin, resampledMax, minY, maxY)
            context.lineTo(x, y);
        }
        context.stroke();
        this.waveformImage = context.getImageData(0, 0, width, height);
        this.setState({ ready: true });
    }

    cancelAnimations() {
        window.cancelAnimationFrame(this.nextAnimationId);
    }

    close() {
        this.cancelAnimations();
        this.props.close();
    }

    leftAreaStyle() {
        if (!this.state.ready) return { width: "20px" };
        const { loopStart, duration } = this.audio;
        const leftBound = 20;
        const rightBound = this.canvasWidth - 20;
        const width = linMap(loopStart, 0, duration, leftBound, rightBound);
        return {
            width: `${ width }px`
        }
    }
    
    rightAreaStyle() {
        if (!this.state.ready) return { width: "20px" };
        const { loopEnd, duration } = this.audio;
        const leftBound = 20;
        const rightBound = this.canvasWidth - 20;
        const width = this.canvasWidth - linMap(loopEnd, 0, duration, leftBound, rightBound);
        return {
            width: `${ width }px`
        }
    }

    render() {
        return <React.Fragment>
            <div className="blurbackground" onClick={ () => this.close() }></div>
            <div className="editor">
              <div className="frame">
                <div className="left-section" style={ this.leftAreaStyle() }>
                  <div className="bar"></div>
                </div>
                <canvas style={
                    { visible: this.state.ready }
                } ref={this.canvasRef} width="610px" height="300px" className="waveform"></canvas>
                <div className="right-section" style={ this.rightAreaStyle() }>
                  <div className="bar"></div>
                </div>
              </div>
            </div>
        </React.Fragment>
    }
}


export default Editor;