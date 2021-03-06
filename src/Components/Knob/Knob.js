import React from 'react';
import PropTypes from 'prop-types';

import { linMap, boundedLinMap, bounded } from 'Utils/linearInterpolation';
import './Knob.css';

const PIXEL_TOLERANCE = 100;



/**
 * A controlled component behaving similarly to a Range (slider),
 * but displaying a knob/dial control.
 */
class Knob extends React.Component {

    constructor(props) {
        super(props);
        this.precision = props.precision === undefined ? 1 : props.precision;
        this.pixelDiff = 0;
        this.knobRef = React.createRef();
        this.state = { dragging: false };
        this.registerHandler();
    }

    onMouseDown(event) {
        const initialY = event.clientY;
        const { min, max, onChange, value } = this.props;
        const that = this;

        // Don't set any listeners after a right-click.
        if (event.button !== 0) {
            event.preventDefault();
            return;
        }

        // Alt-click means we should start listening for MIDI events.
        if (event.altKey) {
            event.preventDefault();
            this.props.appAudio.midiLearn(this.props.id);
            return;
        }
        
        if (event.metaKey) {
            event.preventDefault();
            this.props.onChange(this.props.default);
            return;
        }

        /**
         * Calculate the new value for the knob given how far the
         * user's mouse has moved.
         */
        function mouseMoved(event) {
            /*
            The mouse can move up to PIXEL_TOLERANCE pixels up and down.
            Let's say it starts at 50 and moves to 30, where pixel_tolerance is 100.
            It's moved +20 pixels out of a possible 100 (pixels go down).
            We'll say that's a +20% change.
            Let's say our knob values go from 300 to 700.
            We map that +20% change onto the range (-400, +400) to get +80.
            Our new value is therefore current_value+80.
            */

            const mouseY = event.clientY;
            const pixelDiff = initialY - mouseY;  // Flip the y axis – for us, up really means up.
            that.pixelDiff = pixelDiff;
            const valueBreadth = max - min;
            const valueDiff = linMap(pixelDiff, -PIXEL_TOLERANCE, PIXEL_TOLERANCE, -valueBreadth, valueBreadth);
            const newValue = bounded(value + valueDiff, min, max);
            onChange(newValue);
            event.preventDefault();
            event.stopPropagation();
        }
        
        /**
         * Stop listening to the user's mouse movements.
         */
        function mouseUp(event) {
            document.removeEventListener("mouseup", mouseUp);
            document.removeEventListener("mousemove", mouseMoved);
            that.setState({ dragging: false });
        }
        
        document.addEventListener("mousemove", mouseMoved);
        document.addEventListener("mouseup", mouseUp);
        event.preventDefault();
        event.stopPropagation();
        
        this.setState({ dragging: true });
    }
  
    /**
    * Utility method to calculate the knob's "rotate" transform
    * property, given its current value.
    */
    knobStyle() {
        const { value, min, max } = this.props;
        const angle = boundedLinMap(value, min, max, -Math.PI, Math.PI);
        return { transform: `rotate(${angle}rad)` };
    }
    
    knobValueStyle() {
        const { x, y, height, width } = this.knobRef.current.getBoundingClientRect();
        let realWidth = width === 300 ? 25 : width;
        const yDiff = this.showBottom ? height + 20 : -70;
        return {
            top: `${y + yDiff}px`,
            left: `${x + realWidth/2}px`
        }
    }
  
    get showBottom() {
        return this.pixelDiff > 0;
    }
  
    render() {
        const valueClass = "value " + (this.pixelDiff > 0 ? "bottom" : "top");
        const scale = this.props.scale || 1;
        const units = this.props.units || "";
        return <React.Fragment>
            <div className="knob" ref={ this.knobRef }>
                { this.state.dragging && 
                    <div 
                     style={ this.knobValueStyle() } 
                     className={ valueClass }>
                         { `${this.props.label}: ${(this.props.value * scale).toFixed(this.precision)}${units}` }
                     </div> }
                 <div className="knob-inner" style={this.knobStyle()} onMouseDown={ event => this.onMouseDown(event) }>
                     <div className="notch"/>
                 </div>
            </div>
        </React.Fragment>
    }
    
    shouldComponentUpdate(nextProps, nextState) {
        return (nextProps.value !== this.props.value) || (this.state.dragging !== nextState.dragging);
    }
    
    gotMidi(value) {
        this.props.onChange(
            linMap(value, 0, 127, this.props.min, this.props.max)
        );
    }
    
    registerHandler() {
        this.props.appAudio.registerHandler(this.props.id, value => this.gotMidi(value)); 
    }
    
    componentDidUpdate() {
        this.registerHandler();
    }
}


Knob.propTypes = {
    value: PropTypes.number.isRequired,
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    default: PropTypes.number.isRequired,
    appAudio: PropTypes.any.isRequired,
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    units: PropTypes.string
}


export default Knob;