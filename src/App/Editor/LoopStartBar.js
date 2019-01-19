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


export default function LoopStartBar(props) {
    
    const { loopStart, duration } = props.audio;
    const leftBound = props.padding;
    const rightBound = props.canvas.width - props.padding;
    const width = linMap(loopStart, 0, duration, leftBound, rightBound);
    
    function onMouseDown(event) {
        function onMouseUp(event) {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        }
        
        function onMouseMove(event) {
            // Find the bounded position of the mouse relative to the canvas.
            const canvasAbsoluteLeft = props.canvas.getBoundingClientRect().left;
            let x = event.clientX - canvasAbsoluteLeft;
            
            // console.log(x);

            // Calculate relative X position bounds for the mouse.
            const canvasLeft = 0;
            const canvasRight = props.canvas.width;
            
            // Map the relative mouse position to the values.
            const newValue = boundedLinMap(x, canvasLeft, canvasRight, 0, duration);
            props.onChange(newValue);
        }
        
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    }
    
    return <div className="left-section" style={ { width: `${width}px` } }>
      <div className="bar" onMouseDown={onMouseDown}></div>
    </div>    
}
