import React from 'react';
import PropTypes from 'prop-types';


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


export default class Slider extends React.Component {
    constructor(props) {
        super(props);
        this.sliderRef = React.createRef();
        this.props = props;
        this.registerHandler();
        this.state = {
            dragging: false
        }
    }
    
    onMouseDown(event) {
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
         * Stop listening to the user's mouse movements.
         */
        function mouseUp(event) {
            document.removeEventListener("mouseup", mouseUp);
            that.setState({ dragging: false });
        }
        
        document.addEventListener("mouseup", mouseUp);
        event.stopPropagation();
        
        this.setState({ dragging: true });
    }
    
    knobValueStyle() {
        const { x, y, height, width } = this.sliderRef.current.getBoundingClientRect();
        let realWidth = width === 300 ? 25 : width;
        const yDiff = this.showBottom ? height + 20 : -70;
        return {
            top: `${y + yDiff}px`,
            left: `${x + realWidth/2}px`
        }
    }
    
    render() {
        const { min, max, step } = this.props;
        const valueClass = "value " + (this.pixelDiff > 0 ? "bottom" : "top");
        const scale = this.props.scale || 1;
        const units = this.props.units || "";
        const precision = this.props.precision !== undefined ? this.props.precision : 1;

        return <React.Fragment>
            { this.state.dragging && 
                <div 
                 style={ this.knobValueStyle() } 
                 className={ valueClass }>
                     { `${this.props.label}: ${(this.props.value * scale).toFixed(precision)}${units}` }
                 </div> }
             <input type="range" min={ min } max={ max } 
                 className="slider" step={ step }
                 ref={ this.sliderRef }
                 value={ this.props.value } 
                 style={ { cursor: "pointer" } }
                 onMouseDown={ event => this.onMouseDown(event) }
                 onChange={ event => this.props.onChange(event.target.valueAsNumber) }
             ></input>
        </React.Fragment>
        
    }
    
    gotMidi(value) {
        this.props.onChange(
            linMap(value, 0, 127, this.props.min, this.props.max)
        );
    }
    
    registerHandler() {
        this.props.appAudio.registerHandler(this.props.id, value => this.gotMidi(value)); 
    }
    
    componentDidMount() {
        this.registerHandler();
    }
}


Slider.propTypes = {
    value: PropTypes.number.isRequired,
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    default: PropTypes.number.isRequired,
    appAudio: PropTypes.any.isRequired,
    id: PropTypes.string.isRequired
}