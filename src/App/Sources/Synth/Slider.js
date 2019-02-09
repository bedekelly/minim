import React from 'react';


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
        this.props = props;
        this.registerHandler();
    }
    
    onClick(event) {
        
        // Disable right-click.
        if (event.button !== 0) {
            event.preventDefault();
        }

        // Alt-click means we should start listening for MIDI events.
        else if (event.altKey) {
            event.preventDefault();
            console.log(this.props.id);
            this.props.appAudio.midiLearn(this.props.id);
        }
    }
    
    render() {
        const { min, max, step } = this.props;
        return <input type="range" min={ min } max={ max } 
            className="slider" step={ step }
            value={ this.props.value } 
            onClick={ event => this.onClick(event) }
            onChange={ event => this.props.onChange(event.target.value) }
        ></input>
    }
    
    gotMidi(value) {
        this.props.onChange(
            linMap(value, 0, 127, this.props.min, this.props.max)
        );
    }
    
    registerHandler() {
        console.log("registering", this.gotMidi);
        this.props.appAudio.registerHandler(this.props.id, value => this.gotMidi(value)); 
    }
    
    componentDidMount() {
        this.registerHandler();
    }
    
}