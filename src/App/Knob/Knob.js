import React from 'react';
import './Knob.css';

const PIXEL_TOLERANCE = 100;


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


/**
 * Linearly map a value from one range to another, then clamp the
 * result to the second range.
 */
function boundedLinMap(value, fromLower, fromUpper, toLower, toUpper) {
  const newValue = linMap(value, fromLower, fromUpper, toLower, toUpper);
  return bounded(newValue, toLower, toUpper);
}


/**
 * A controlled component behaving similarly to a Range (slider),
 * but displaying a knob/dial control.
 */
class Knob extends React.Component {

  onMouseDown(event) {
    const initialY = event.clientY;
    const { min, max, onChange, value } = this.props;
    
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
        const valueBreadth = max - min;
        const valueDiff = linMap(pixelDiff, -PIXEL_TOLERANCE, PIXEL_TOLERANCE, -valueBreadth, valueBreadth);
        const newValue = bounded(value + valueDiff, min, max);
        onChange(newValue);
        event.preventDefault()
        event.stopPropagation();
    }
    
    /**
     * Stop listening to the user's mouse movements.
     */
    function mouseUp(event) {
        document.removeEventListener("mouseup", mouseUp);
        document.removeEventListener("mousemove", mouseMoved)
    }
    
    document.addEventListener("mousemove", mouseMoved);
    document.addEventListener("mouseup", mouseUp);
    event.preventDefault();
    event.stopPropagation();
  }
  
  /**
   * Utility method to calculate the knob's "rotate" transform
   * property, given its current value.
   */
  knobStyle() {
    const { value, min, max } = this.props;
    const angle = boundedLinMap(value, min, max, -Math.PI, Math.PI);
    const style = {
      transform: `rotate(${angle}rad)`
    };
    return style;
  }
  
  render() {
    return <React.Fragment>
        <div className="knob-group">
            <div className="knob" style={this.knobStyle()} 
                onMouseDown={ event => this.onMouseDown(event) }>
                <div className="notch"></div>
            </div>
            <div class="value">{ this.props.value.toFixed(1) }</div>
        </div>
    </React.Fragment>
  }
}


export default Knob;