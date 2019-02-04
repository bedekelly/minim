import React from 'react';

import './TextValue.css';


export default class TextValue extends React.PureComponent {
  constructor(props) {
    super(props);
    this.onChange = props.onChange;
    this.state = {};
  }
  
  startListening({ clientY }) {
    const initialY = clientY;
    const initialValue = this.props.value;
    const onChange = this.onChange;
    
    function mouseUp(event) {
      document.removeEventListener("mouseup", mouseUp);
      document.removeEventListener("mousemove", mouseMove);
    }
    
    function mouseMove(event) {
      const newValue = initialValue - event.clientY + initialY;
      onChange(newValue);
    }
    
    document.addEventListener("mouseup", mouseUp);
    document.addEventListener("mousemove", mouseMove);
  }
  
  render() {
    return <span className="text-value-control" onMouseDown={ event => this.startListening(event) }>{ this.props.value }</span>
  }
}
