import React from 'react';
import PropTypes from 'prop-types';

import './TextValue.css';

const PIXEL_TOLERANCE = 200;


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

/**
 * Clamp a value to the range lower <= value <= upper.
 */
function bounded(value, lower, upper) {
    if (value > upper) return upper;
    if (value < lower) return lower;
    return value;
}


export default class TextValue extends React.PureComponent {

    constructor(props) {
        super(props);
        this.min = props.min;
        this.max = props.max;
        this.onChange = props.onChange;
        this.state = {};
    }
    
    componentDidUpdate(newProps) {
        this.min = newProps.min;
        this.max = newProps.max;
    }
    
    startListening({ clientY }) {
        const initialY = clientY;
        const initialValue = this.props.value;
        const { min, max, onChange } = this;
        const that = this;

        function mouseUp(event) {
            document.removeEventListener("mouseup", mouseUp);
            document.removeEventListener("mousemove", mouseMove);
            that.setState({ active: false });
        }

        function mouseMove(event) {
            const mouseY = event.clientY;
            const pixelDiff = initialY - mouseY;  // Flip the y axis – for us, up really means up.
            that.pixelDiff = pixelDiff;
            const valueBreadth = max - min;
            const valueDiff = linMap(pixelDiff, -PIXEL_TOLERANCE, PIXEL_TOLERANCE, -valueBreadth, valueBreadth);
            const newValue = bounded(initialValue + valueDiff, min, max);
            onChange(Math.round(newValue));
        }

        document.addEventListener("mouseup", mouseUp);
        document.addEventListener("mousemove", mouseMove);
        this.setState({ active: true });
    }

    render() {
        return <span 
            className={ "text-value-control" + (this.state.active ? " active" : "") }
            onMouseDown={ event => this.startListening(event) }
            >{ this.props.value }
            {this.props.label && 
                <span className="label">{ this.props.label }</span>
            }
        </span>
    }
}


TextValue.propTypes = {
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
    label: PropTypes.string
}