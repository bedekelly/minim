import React from 'react';
import PropTypes from 'prop-types';

import './WaveformDisplay.css';

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


class WaveformDisplay extends React.Component {
    
    constructor(props) {
        super(props);
        this.width = props.width;
        this.height = props.height;
        this.buffer = props.buffer;
        this.canvas = React.createRef();
        this.state = { audioId: props.audioId };
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
    
    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.audioId !== this.state.audioId;
    }
    
    writeData() {
        const width = this.width;
        const height = this.height;
        const leftChannel = this.buffer.getChannelData(0);
        const { resampledMin, resampledMax, resampledBuffer } = WaveformDisplay.analyse(leftChannel, width);
        const context = this.canvas.current.getContext("2d");
        const minY = height;
        const maxY = 0;

        context.clearRect(0, 0, width, height);
        context.beginPath();
        const middleY = height / 2;
        context.moveTo(0, middleY);

        for (let x=0; x<width; x++) {
            let value = resampledBuffer[x];
            let y = linMap(value, resampledMin, resampledMax, minY, maxY)
            context.lineTo(x, y);
        }
        context.stroke();
    }
    
    componentDidMount() {
        this.writeData();
    }
    
    componentDidUpdate() {
        this.writeData();
    }
    
    render() {
        return <canvas 
                className="waveform-display"
                width={ `${this.width}px` } 
                height={ `${this.height}px` } 
                ref={ this.canvas }>
               </canvas>
    }
}


WaveformDisplay.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    buffer: PropTypes.any.isRequired
}


export default WaveformDisplay;