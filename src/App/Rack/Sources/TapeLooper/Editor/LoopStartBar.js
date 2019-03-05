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


class LoopStartBar extends React.Component {
    
    constructor(props) {
        super(props);
        this.props = props;
        this.state = { width: this.calculateWidth() };
        this.loopStart = this.props.audio.loopStart;
    }
    
    calculateWidth() {
        const { loopStart, duration } = this.props.audio;
        const leftBound = 0;
        const rightBound = this.props.canvas.width;
        const width = this.props.padding + linMap(loopStart, 0, duration, leftBound, rightBound);
        return width;
    }
    
    componentDidUpdate(newProps, newState) {
        if (newProps.audio.loopStart !== this.loopStart) {
            this.setState({ width: this.calculateWidth() });
            this.loopStart = newProps.audio.loopStart;
        }
    }
    
    render() {
        const props = this.props;
        const that = this;
        
        function onMouseDown(event) {
            function onMouseUp(event) {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
                const duration = props.audio.duration;
                const value = boundedLinMap(that.state.width, 20, props.canvas.width+20, 0, duration);
                props.onChange(value);
            }
            
            function onMouseMove(event) {
                // Find the bounded position of the mouse relative to the canvas.
                const canvasAbsoluteLeft = props.canvas.getBoundingClientRect().left;
                let x = event.clientX - canvasAbsoluteLeft;
                x = boundedLinMap(x, 0, props.canvas.width, 20, props.canvas.width+20);
                that.setState({ width: x })
            }
            
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        }
        
        const className = "left-section" + (props.enabled ? "" : " greyed-out");
        return <div className={ className } style={ { width: `${this.state.width}px` } }>
          <div className="bar" onMouseDown={onMouseDown}></div>
        </div> 
    }
       
}


export default LoopStartBar;