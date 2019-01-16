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
    }
    
    componentDidMount() {
        this.context = this.canvasRef.current.getContext("2d");
        this.canvasWidth = this.canvasRef.current.width;
        this.canvasHeight = this.canvasRef.current.height;
        this.renderWaveformToCanvas();
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
        
        this.setState({ ready: true });
    }

    close() {
        this.props.close();
    }

    render() {
        return <React.Fragment>
            <div className="blurbackground" onClick={ () => this.close() }></div>
            <div className="editor">
              <div className="frame">
                <div className="left-section">
                  <div className="bar"></div>
                </div>
                <canvas style={
                    { visible: this.state.ready }
                } ref={this.canvasRef} width="610px" height="300px" className="waveform"></canvas>
                <div className="right-section">
                  <div className="bar"></div>
                </div>
              </div>
            </div>
        </React.Fragment>
    }
}


export default Editor;