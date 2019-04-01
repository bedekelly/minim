import React from 'react';
import { linMap, boundedLinMap } from 'Utils/linearInterpolation';


class LoopEndBar extends React.Component {
    
    constructor(props) {
        super(props);
        this.props = props;
        const { loopEnd, duration } = props.audio;
        const leftBound = 0;
        const rightBound = props.canvas.width;
        const width = props.padding + linMap(loopEnd, 0, duration, rightBound, leftBound);
        this.state = { width };
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
                props.onChange(duration - value);
            }
            
            function onMouseMove(event) {
                // Find the bounded position of the mouse relative to the canvas.
                const canvasAbsoluteRight = props.canvas.getBoundingClientRect().right;
                let x = canvasAbsoluteRight - event.clientX;
                x = boundedLinMap(x, 0, props.canvas.width, 20, props.canvas.width+20);
                that.setState({ width: x })
            }
            
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        }
        
        const className = "right-section" + (props.enabled ? "" : " greyed-out");
        return <div className={ className } style={ { width: `${this.state.width}px` } }>
          <div className="bar" onMouseDown={onMouseDown}></div>
        </div> 
    }
       
}


export default LoopEndBar;