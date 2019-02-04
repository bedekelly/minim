import React from 'react';
import TextValue from '../TextValue';

import './Sequencer.css';


const SIZE = 300;


export default class Sequencer extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { beatsPerMeasure: 4, bpm: 120 };
    this.canvas = React.createRef();
    this.startTime = performance.now();
  }
  
  get frequency() {
    return this.state.bpm / 60;
  }
  
  renderFrame(timestamp) {
    timestamp |= 0;
    const timeDelta = (timestamp - this.startTime) / 1000;
    const innermostAngleTravelled = timeDelta * -2 * Math.PI * this.frequency;

    if (!this.context.clearRect ) {
      this.context = this.canvas.current.getContext("2d");
    }

    const ctx = this.context;
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#999";
    
    // Assuming the max bpm is 27, split 270px into bpm.
    
    const totalSpace = SIZE / 2 - 20;
    const circleRadius = totalSpace / this.state.beatsPerMeasure;
    
    for ( let i=1; i<=this.state.beatsPerMeasure; i++) {
      ctx.beginPath();
      ctx.arc(SIZE/2, SIZE/2, circleRadius * i, 0, 2 * Math.PI);
      ctx.stroke();

      const angleTravelled = innermostAngleTravelled / i;
      const x = circleRadius * i * Math.sin(Math.PI + angleTravelled);
      const y = circleRadius * i * Math.cos(Math.PI + angleTravelled);
      ctx.beginPath();
      ctx.arc(SIZE/2+x, SIZE/2+y, 4, 0, 2 * Math.PI);
      ctx.fill();
    }

    requestAnimationFrame(timestamp => this.renderFrame(timestamp));
  }

  componentDidMount() {
   this.context = this.canvas.current.getContext("2d");
   this.renderFrame();
  }

  render() {
    return <div className="sequencer">
      <TextValue value={this.state.beatsPerMeasure} onChange={ beatsPerMeasure => this.setState({ beatsPerMeasure })}/>
      <TextValue value={this.state.bpm} onChange={ bpm => this.setState({ bpm })}/>
      <canvas id="canvas" width={ `${SIZE}px` } height={ `${SIZE}px` } ref={ this.canvas }></canvas>
      <div className="buttons">
        <div className="button"></div>
        <div className="button"></div>
        <div className="button"></div>
        <div className="button"></div>
        <div className="button"></div>
        <div className="button"></div>
        <div className="button"></div>
        <div className="button"></div>
        <div className="button"></div>
        <div className="button"></div>
        <div className="button"></div>
        <div className="button"></div>
        <div className="button selected"></div>
        <div className="button"></div>
        <div className="button"></div>
        <div className="button"></div>
      </div>
    </div>;
  }
}