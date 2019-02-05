import React from 'react';
import TextValue from '../TextValue';
import MPCDrumSelector from './MPCDrumSelector';

import './Sequencer.css';


const SIZE = 300;


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


export default class Sequencer extends React.PureComponent {
    constructor(props) {
        super(props);
        this.audio = props.audio;
        this.audioContext = props.appAudio.context;
        this.canvas = React.createRef();
        this.startTime = this.audioContext.currentTime;
        this.state = { 
            beatsPerMeasure: this.audio.timeSignature, 
            bpm: this.audio.bpm, 
            placingItem: true,
            notes: [],
            closestPoint: null,
            mousePos: {x:-10, y: -10},
            selectedDrum: 0
        };
    }
    
    get frequency() {
        return this.state.bpm / 60;
    }
    
    radiusOfRing(num) {
        const totalSpace = SIZE / 2 - 20;
        const circleRadius = totalSpace / this.state.beatsPerMeasure;
        return num * circleRadius;
    }
    
    get selectedDrumMIDI() {
        return [144, 36 + this.state.selectedDrum];
    }
    
    renderFrame() {
        // Calculate angle travelled by the innermost, one-beat-per-cycle ring.
        const time = this.audio.currentRelativeTime;
        const outermostAngleTravelled = time * -2 * Math.PI * this.frequency / this.state.beatsPerMeasure;
        
        // If for some reason the canvas has reloaded, renew our 2d drawing context.
        if (!this.context.clearRect ) {
            this.context = this.canvas.current.getContext("2d");
        }
        
        // Clear the canvas.
        const ctx = this.context;
        ctx.clearRect(0, 0, SIZE, SIZE);

        // Set an "infinitely far away" closest point to iterate from.
        let closestPoint = { dist: 100000000 };
        
        // Draw each ring in turn.
        for ( let ring=1; ring<=this.state.beatsPerMeasure; ring++) {
            
            // Set options for drawing rings.
            ctx.lineWidth = 2;
            ctx.fillStyle = "#222";
            
            // Draw rings.
            ctx.beginPath();
            const radius = this.radiusOfRing(ring);
            ctx.arc(SIZE/2, SIZE/2, radius, 0, 2 * Math.PI);
            ctx.stroke();
            
            // Draw "current position" indicators.
            const beats = this.state.beatsPerMeasure;
            const cyclesPerBar = beats - ring + 1;
            const angleTravelled = outermostAngleTravelled * cyclesPerBar;
            const x = radius * Math.sin(Math.PI + angleTravelled);
            const y = radius * Math.cos(Math.PI + angleTravelled);
            ctx.beginPath();
            ctx.arc(SIZE/2+x, SIZE/2+y, 4, 0, 2 * Math.PI);
            ctx.fill();
            
            // Update the "closest point" in the state.
            let mouse = this.state.mousePos;
            const mag = Math.hypot(mouse.x, mouse.y);
            let circleX = SIZE/2 + mouse.x / mag * radius;
            let circleY = SIZE/2 + mouse.y / mag * radius;
            
            let dist = Math.hypot((mouse.x + SIZE/2 - circleX), (mouse.y + SIZE/2 - circleY));
            if ( dist < closestPoint.dist ) {
                closestPoint.coords = { x: circleX, y: circleY };
                closestPoint.dist = dist;
                closestPoint.ring = ring;
                this.setState({ placingItem: true, closestPoint });
            }
        }
        
        // Draw all notes
        ctx.fillStyle = "rgba(100, 255, 20, 1)"
        for (let { ring, angle } of this.state.notes) {
            const radius = this.radiusOfRing(ring);
            const x = radius * Math.sin(angle);
            const y = -radius * Math.cos(angle);
            ctx.beginPath();
            ctx.arc(SIZE/2+x, SIZE/2+y, 7, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        ctx.fillStyle = "rgba(20, 20, 20, 0.2)"
        if (closestPoint.dist <= 17) {
            ctx.beginPath();
            ctx.arc(closestPoint.coords.x, closestPoint.coords.y, 10, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        
        requestAnimationFrame(timestamp => this.renderFrame(timestamp));
    }
    
    componentDidMount() {
        this.context = this.canvas.current.getContext("2d");
        this.renderFrame();
    }
    
    onMouseMove(event) {
        const { x: canvasX, y: canvasY } = this.canvas.current.getBoundingClientRect();
        this.setState({mousePos: {y: event.clientY-SIZE/2-canvasY, x: event.clientX-SIZE/2-canvasX}});
    }
    
    addNoteAt(ring, angle) {
        // Add the note to our state to draw.
        this.setState({notes: [...this.state.notes, { ring, angle }]});
        
        // Given the index of a ring and an angle, calculate the beat
        // a note should fall and add it to our sequencer-audio.

        // If it's the outermost ring, just map it between a and the number of beats per measure.
        // If it's the innermost ring, create beatsPerMeasure copies and spread them equally.
        
        // Generally, if it's the nth ring from the outside, there are n cycles in a bar.
        // Furthest ring out has 1 cycle in a bar; 4th ring in has 4 cycles in a bar.
        
        const numCycles = (this.state.beatsPerMeasure - ring + 1);
        
        // Loop `numCycles` times, splitting total time into `numCycles` chunks.
        // Add a note `angle/2pi` through each chunk.
        // const angleThroughBar = linMap(angle, 0, Math.PI*2, 1, this.beatsPerMeasure+1);
        const beatsPerCycle = this.state.beatsPerMeasure / numCycles;

        for (let cycle=0; cycle<numCycles; cycle++) {
            const fractionalBeatInCycle = linMap(angle, 0, Math.PI*2, 0, beatsPerCycle);
            const fractionalBeat = cycle * beatsPerCycle + fractionalBeatInCycle;
            let beat = Math.round(fractionalBeat);
            const offset = (fractionalBeat - beat) * 100;
            if (beat > this.state.beatsPerMeasure) beat -= this.state.beatsPerMeasure;
            beat = 1 + beat % this.state.beatsPerMeasure;
            this.audio.addNote({ beat, offset, data: this.selectedDrumMIDI })
        }
    }
    
    onMouseDown(event) {
        event.preventDefault();
        event.stopPropagation();
        if (!this.state.closestPoint || !this.state.placingItem) return;
        
        // Given a point (X, Y) on circle C of centre (Cx, Cy) and radius R, 
        // calculate the angle between the vertical and the line joining the 
        // centre of C and the point (x, y).
        // tan(theta) = opposite/adjacent
        //            = (x-cx) / (y-cy)
        const { coords: { x, y }, ring } = this.state.closestPoint;
        const angle = Math.PI - Math.atan2(x - SIZE/2, y - SIZE/2);
        this.addNoteAt(ring, angle);
    }
    
    render() {
        return <div className="sequencer">
            <TextValue value={this.state.beatsPerMeasure} onChange={ beatsPerMeasure => this.setState({ beatsPerMeasure })}/>
            <TextValue value={this.state.bpm} onChange={ bpm => this.setState({ bpm })}/>
            <canvas onMouseDown={ e => this.onMouseDown(e) } onMouseMove={ e => this.onMouseMove(e) } id="canvas" width={ `${SIZE}px` } height={ `${SIZE}px` } ref={ this.canvas }></canvas>
            <MPCDrumSelector value={ this.state.selectedDrum } onChange={ selectedDrum => this.setState({ selectedDrum })} />
        </div>;
    }
}