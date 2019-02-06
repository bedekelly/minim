import React from 'react';
import TextValue from '../TextValue';
import MPCDrumSelector from './MPCDrumSelector';

import './Sequencer.css';


const SIZE = 300;
const COLOURS = [
    "rgb(0, 0, 0)",
    "rgb(255, 0, 0)",
    "rgb(173, 35, 35)",
    "rgb(42, 75, 215)",
    "rgb(29, 105, 20)",
    "rgb(129, 74, 25)",
    "rgb(129, 38, 192)",
    "rgb(160, 160, 160)",
    "rgb(129, 197, 122)",
    "rgb(157, 175, 255)",
    "rgb(41, 208, 208)",
    "rgb(255, 146, 51)",
    "rgb(255, 238, 51)",
    "rgb(233, 222, 187)",
    "rgb(255, 205, 243)",
    "rgb(255, 255, 255)"
]

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

const shallowCompare = (obj1, obj2) =>
  Object.keys(obj1).length === Object.keys(obj2).length &&
  Object.keys(obj1).every(key => 
    obj2.hasOwnProperty(key) && obj1[key] === obj2[key]
  );


function removeFromArray(removeItem, array) {
    return array.filter(i => !shallowCompare(i, removeItem));
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
            notes: [],
            draggingNote: null,
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
    
    componentDidUpdate() {
        this.context = this.canvas.current.getContext("2d");
    }
    
    refreshContext() {
        if (!this.context.clearRect ) this.context = this.canvas.current.getContext("2d");
        return this.context;
    }
    
    renderFrame() {
        this.refreshContext();

        // Calculate clockwise progress through the bar, in radians.
        const outermostAngleTravelled = this.audio.currentProgress * -2 * Math.PI;
        
        // const time = this.audio.currentRelativeTime;
        // const outermostAngleTravelled = (
            // time * -2 * Math.PI * this.frequency / this.state.beatsPerMeasure);
        
        // Update the canvas with the current state.
        this.context.clearRect(0, 0, SIZE, SIZE);
        this.drawRings(outermostAngleTravelled);
        this.drawAllNotes();
        this.drawNoteGhost();
        if (this.state.draggingNote) this.drawDraggingNote();
        requestAnimationFrame(timestamp => this.renderFrame(timestamp));
    }
    
    drawDraggingNote() {
        const point = this.getClosestPointToMouse();
        if (!point) return;
        const colour = COLOURS[this.state.draggingNote.drum];
        console.log({ point, colour });
        this.drawNote(point.coords.x - SIZE/2, point.coords.y - SIZE/2, colour);
    }
    
    drawPositionIndicator(ring, outermostAngleTravelled) {
        const ctx = this.refreshContext();
        const radius = this.radiusOfRing(ring);
        const beats = this.state.beatsPerMeasure;
        const cyclesPerBar = beats - ring + 1;
        const angleTravelled = outermostAngleTravelled * cyclesPerBar;
        const x = radius * Math.sin(Math.PI + angleTravelled);
        const y = radius * Math.cos(Math.PI + angleTravelled);
        ctx.beginPath();
        ctx.arc(SIZE/2+x, SIZE/2+y, 4, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    drawRings(angleTravelled) {
        for (let ring=1; ring<=this.state.beatsPerMeasure; ring++) {
            this.drawRing(ring);
            this.drawPositionIndicator(ring, angleTravelled);
        }
    }

    drawRing(ring) {
        const ctx = this.refreshContext();
        ctx.lineWidth = 2;
        ctx.fillStyle = "#555";
        ctx.strokeStyle = "#555";

        ctx.beginPath();
        const radius = this.radiusOfRing(ring);
        ctx.arc(SIZE/2, SIZE/2, radius, 0, 2 * Math.PI);
        ctx.stroke();
    }
    
    getClosestPointToMouse() {
        let closestPoint = { dist: 123456 };
        for (let ring = 1; ring <= this.state.beatsPerMeasure; ring++) {
            const radius = this.radiusOfRing(ring);
            let mouse = this.state.mousePos;
            const mag = Math.hypot(mouse.x, mouse.y);
            let circleX = SIZE/2 + mouse.x / mag * radius;
            let circleY = SIZE/2 + mouse.y / mag * radius;
            let dist = Math.hypot((mouse.x + SIZE/2 - circleX), (mouse.y + SIZE/2 - circleY));
            if ( dist < closestPoint.dist ) {
                closestPoint.coords = { x: circleX, y: circleY };
                closestPoint.dist = dist;
                closestPoint.ring = ring;
            }
        }
        if (closestPoint.coords) return closestPoint;
        else return null;
    }
    
    get hoveringOverNote() {
        const point = this.getClosestPointToMouse();
        if (!point) return false;
        const { coords: { x, y } } = point;
        for (let note of this.state.notes) {
            const dist = Math.hypot(x - note.x, y - note.y);
            if (dist < 13) return note;
        }
        return false;
    }
    
    drawNoteGhost() {
        const closestPoint = this.getClosestPointToMouse();
        if (!closestPoint || closestPoint.dist > 17) return;
        if (this.state.dragging) return;
        if (this.hoveringOverNote) return;
        this.drawNote(
            closestPoint.coords.x - SIZE/2, 
            closestPoint.coords.y - SIZE/2, 
            "rgba(20, 20, 20, 0.2)", 10
        );
    }
    
    drawNote(x, y, colour, size) {
        size |= 7;
        const ctx = this.refreshContext();
        ctx.fillStyle = colour;
        ctx.beginPath();
        ctx.arc(SIZE/2+x, SIZE/2+y, 7, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = "#222";
        ctx.stroke();
    }
    
    drawAllNotes() {
        for (let { ring, angle, drum } of this.state.notes) {
            const radius = this.radiusOfRing(ring);
            const x = radius * Math.sin(angle);
            const y = -radius * Math.cos(angle);
            const fill = COLOURS[drum];
            this.drawNote(x, y, fill);
        }
    }
    
    componentDidMount() {
        this.renderFrame();
    }
    
    onMouseMove(event) {
        const { x: canvasX, y: canvasY } = this.canvas.current.getBoundingClientRect();
        this.setState({mousePos: {y: event.clientY-SIZE/2-canvasY, x: event.clientX-SIZE/2-canvasX}});
    }
    
    async addNoteAt(ring, angle, x, y, note) {
        const drum = note ? note.drum : this.state.selectedDrum;
        await this.setState({notes: [...this.state.notes, { ring, angle, drum, x, y }]});
        this.addAudioNote(angle, ring)
    }
    
    addAudioNote(angle, ring) {
        const numCycles = (this.state.beatsPerMeasure - ring + 1);
        const beatsPerCycle = this.state.beatsPerMeasure / numCycles;
        const notes = [];
        for (let cycle=0; cycle<numCycles; cycle++) {
            const fractionalBeatInCycle = linMap(angle, 0, Math.PI*2, 0, beatsPerCycle);
            const fractionalBeat = cycle * beatsPerCycle + fractionalBeatInCycle;
            let beat = Math.round(fractionalBeat);
            const offset = (fractionalBeat - beat) * 100;
            if (beat > this.state.beatsPerMeasure) beat -= this.state.beatsPerMeasure;
            beat = 1 + beat % this.state.beatsPerMeasure;
            
            console.log("Adding note: ");
            console.log({ beat, offset })
            notes.push({ beat, offset, data: this.selectedDrumMIDI });
        }
        this.audio.addNotes(notes);
    }
    
    addAllAudioNotes() {
        for (let { angle, ring } of this.state.notes) {
            this.addAudioNote(angle, ring);
        }
    }
    
    onMouseDown(event) {
        event.preventDefault();
        event.stopPropagation();

        const hoverNote = this.hoveringOverNote;
        if (hoverNote) {
            const notes = removeFromArray(hoverNote, this.state.notes)
            this.setState({ draggingNote: hoverNote, notes })
        } else {
            this.addNoteHere()
        }
        
    }

    clearAll() {
        this.setState({notes: []});
        this.audio.clearAll();
    }

    setBeatsPerMeasure(beatsPerMeasure) {
        this.setState({ beatsPerMeasure });
        this.audio.timeSignature = beatsPerMeasure;
    }

    setBpm(bpm) {
        this.setState({ bpm });
        this.audio.bpm = bpm;
    }

    async addNoteHere(note) {
        const closestPoint = this.getClosestPointToMouse();
        const { coords: { x, y }, ring } = closestPoint;
        const angle = Math.PI - Math.atan2(x - SIZE/2, y - SIZE/2);
        await this.addNoteAt(ring, angle, x, y, note);
    }

    async onMouseUp(event) {
        if (!this.state.draggingNote) return;
        const note = this.state.draggingNote;
        await this.addNoteHere(note);
        await this.setState({ draggingNote: null });
        this.refreshSequencerNotes();
    }
    
    refreshSequencerNotes() {
        this.audio.clearAll();
        this.addAllAudioNotes();
    }

    render() {
        return <div className="sequencer">
            <TextValue value={this.state.beatsPerMeasure} onChange={ beatsPerMeasure => this.setBeatsPerMeasure(beatsPerMeasure) } />
            <TextValue value={this.state.bpm} onChange={ bpm => this.setBpm(bpm) }/>
            <canvas 
                onMouseDown={ e => this.onMouseDown(e) } 
                onMouseUp={ e => this.onMouseUp(e) }
                onMouseMove={ e => this.onMouseMove(e) } 
                id="canvas" width={ `${SIZE}px` } height={ `${SIZE}px` } 
                ref={ this.canvas }></canvas>
            <MPCDrumSelector 
                value={ this.state.selectedDrum } 
                onChange={ selectedDrum => this.setState({ selectedDrum })} 
                colours={ COLOURS }
                />
            <button className="clear-all" onClick={ () => this.clearAll() }>X</button>
        </div>;
    }
}