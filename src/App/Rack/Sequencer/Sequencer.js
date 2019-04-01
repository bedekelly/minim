import React from 'react';
import TextValue from 'Components/TextValue';
import MPCDrumSelector from './MPCDrumSelector';
import Toggle from './Toggle';


import './Sequencer.css';
import { linMap } from 'Utils/linearInterpolation';

import {library} from '@fortawesome/fontawesome-svg-core';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faPause,
    faPlay,
    faStop,
    faTimes
} from '@fortawesome/pro-solid-svg-icons';

library.add(faPlay, faPause, faStop, faTimes);


const NOTE_SIZE = 7;
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
];


const shallowCompare = (obj1, obj2) =>
  Object.keys(obj1).length === Object.keys(obj2).length &&
  Object.keys(obj1).every(key => 
    obj2.hasOwnProperty(key) && obj1[key] === obj2[key]
  );


function removeFromArray(removeItem, array) {
    return array.filter(i => !shallowCompare(i, removeItem));
}


export default class Sequencer extends React.Component {
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
            snap: true,
            draggingNote: null,
            closestPoint: null,
            mousePos: { x: -10, y: -10 },
            selectedDrum: 0,
            canDragRing: false,
            playing: this.audio.playing
        };
        this.keyDown = this.keyDown.bind(this);
        this.keyUp = this.keyUp.bind(this);
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
        return Sequencer.midiFor(this.state.selectedDrum);
    }
    
    static midiFor(drumIndex) {
        return [144, 36 + drumIndex]
    }
    
    componentDidUpdate(prevProps, prevState) {
        this.context = this.canvas.current.getContext("2d");
        if (this.props.reloadPlayState !== prevProps.reloadPlayState) {
            this.setState({ playing: this.audio.playing });
        }
    }

    keyDown(event) {
        if (!(event.code === "MetaLeft" || event.code === "ControlLeft" )) return;
        this.setState({ canDragRing: true });
    }

    async keyUp(event) {
        if (!(event.code === "MetaLeft" || event.code === "ControlLeft" )) return;
        if (this.state.draggingRing) await this.stopDraggingRing();
        else this.setState({ canDragRing: false });
    }

    refreshContext() {
        if (!this.context.clearRect ) this.context = this.canvas.current.getContext("2d");
        return this.context;
    }

    renderFrame() {
        this.refreshContext();

        // Calculate clockwise progress through the bar, in radians.
        const outermostAngleTravelled = this.audio.currentProgress * -2 * Math.PI;

        // Update the canvas with the current state.
        this.context.clearRect(0, 0, SIZE, SIZE);
        this.drawRings(outermostAngleTravelled);
        this.drawAllNotes();
        this.drawNoteGhost();
        if (this.state.draggingNote) this.drawDraggingNote();
        requestAnimationFrame(timestamp => this.renderFrame(timestamp));
    }

    drawDraggingNote() {
        const point = this.getClosestPointToMouse(true);
        if (!point) return;
        const colour = COLOURS[this.state.draggingNote.drum];
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

    getAngleAtMouse() {
        let { x, y } = this.state.mousePos;
        return Math.PI - Math.atan2(x, y);
    }

    closeToRing(ring) {
        let { x, y } = this.state.mousePos;
        const radius = this.radiusOfRing(ring);
        const distanceFromMiddle = Math.hypot(x, y);
        return Math.abs(radius - distanceFromMiddle) < 5;
    }

    closestRing() {
        for (let ring=1; ring <= this.state.beatsPerMeasure; ring++) {
            if (this.closeToRing(ring)) return ring;
        }
        return null;
    }

    drawRings(angleTravelled) {
        for (let ring=1; ring<=this.state.beatsPerMeasure; ring++) {
            const bold = (
                this.state.canDragRing && 
                !this.state.draggingRing && 
                this.closeToRing(ring) && 
                !this.hoveringOverNote &&
                !this.state.draggingNote
            ) || this.state.draggingRing === ring;
            this.drawRing(ring, bold);
            this.drawPositionIndicator(ring, angleTravelled);
        }
    }

    drawRing(ring, bold) {
        const ctx = this.refreshContext();
        ctx.lineWidth = bold ? 4 : 2;
        ctx.fillStyle = "#555";
        ctx.strokeStyle = "#555";

        ctx.beginPath();
        const radius = this.radiusOfRing(ring);
        ctx.arc(SIZE/2, SIZE/2, radius, 0, 2 * Math.PI);
        ctx.stroke();
    }

    snap(x, y, radius) {
        let circleX = x;
        let circleY = y;
        if (this.state.snap) {
            const angle = Math.PI - Math.atan2(circleX - SIZE/2, circleY - SIZE/2);
            const distanceRoundCircle = angle / 2 / Math.PI;
            const steps = this.state.beatsPerMeasure * 4;
            const roundedDistance = Math.round(distanceRoundCircle * steps) / steps;
            const roundedAngle = Math.PI * 2 * roundedDistance;
            circleX = SIZE/2 + radius * Math.sin(roundedAngle);
            circleY = SIZE/2 + -radius * Math.cos(roundedAngle);
        }
        return [circleX, circleY];
    }
    
    getClosestPointToMouse(snap) {
        let closestPoint = { dist: 123456 };
        for (let ring = 1; ring <= this.state.beatsPerMeasure; ring++) {
            const radius = this.radiusOfRing(ring);
            let mouse = this.state.mousePos;
            const mag = Math.hypot(mouse.x, mouse.y);
            let circleX = SIZE/2 + mouse.x / mag * radius;
            let circleY = SIZE/2 + mouse.y / mag * radius;

            let dist = Math.hypot((mouse.x + SIZE/2 - circleX), (mouse.y + SIZE/2 - circleY));
            if ( dist < closestPoint.dist ) {
                if (circleX !== circleY && snap)
                    [circleX, circleY] = this.snap(circleX, circleY, radius);
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
            if (dist < NOTE_SIZE-1) return note;
        }
        return false;
    }
    
    drawNoteGhost() {
        const closestPoint = this.getClosestPointToMouse(true);
        if (!closestPoint || closestPoint.dist > NOTE_SIZE) return;
        if (this.state.draggingNote) return;
        if (this.hoveringOverNote) return;
        if (this.state.canDragRing) return;
        this.drawNote(
            closestPoint.coords.x - SIZE/2, 
            closestPoint.coords.y - SIZE/2, 
            "rgba(20, 20, 20, 0.2)"
        );
    }
    
    drawNote(x, y, colour) {
        const ctx = this.refreshContext();
        ctx.fillStyle = colour;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(SIZE/2+x, SIZE/2+y, NOTE_SIZE, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = "#222";
        ctx.stroke();
    }

    drawAllNotes() {
        for (let { ring, angle, drum } of this.state.notes) {
            let angleDiff = 0;
            if (this.state.draggingRing === ring) {
                angleDiff = this.getAngleAtMouse() - this.state.ringStartDragAngle;
                if (this.state.snap) {
                    const distanceRoundCircle = angleDiff / 2 / Math.PI;
                    const steps = this.state.beatsPerMeasure * 4;
                    const roundedDistance = Math.round(distanceRoundCircle * steps) / steps;
                    angleDiff = Math.PI * 2 * roundedDistance;
                }
                angle += angleDiff;
            }

            const radius = this.radiusOfRing(ring);
            const x = radius * Math.sin(angle);
            const y = -radius * Math.cos(angle);

            const fill = COLOURS[drum];
            this.drawNote(x, y, fill);
        }
    }

    componentDidMount() {
        this.renderFrame();
        document.addEventListener("keydown", this.keyDown);
        document.addEventListener("keyup", this.keyUp);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.keyDown);
        document.removeEventListener("keyup", this.keyUp);
    }

    onMouseMove(event) {
        const { x: canvasX, y: canvasY } = this.canvas.current.getBoundingClientRect();
        this.setState({mousePos: {y: event.clientY-SIZE/2-canvasY, x: event.clientX-SIZE/2-canvasX}});
    }

    async addNoteAt(ring, angle, x, y, note) {
        const drum = note ? note.drum : this.state.selectedDrum;
        await this.setState({notes: [...this.state.notes, { ring, angle, drum, x, y }]});
        this.addAudioNote(angle, ring, Sequencer.midiFor(drum))
    }
    
    addAudioNote(angle, ring, data) {
        if (data === undefined) data = this.selectedDrumMIDI;
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
            notes.push({ beat, offset, data });
        }
        this.audio.addNotes(notes);
    }
    
    addAllAudioNotes() {
        for (let { angle, ring, drum } of this.state.notes) {
            this.addAudioNote(angle, ring, Sequencer.midiFor(drum));
        }
    }

    async removeNoteHere() {
        const hoverNote = this.hoveringOverNote;
        if (!hoverNote) return;
        await this.setState({ notes: removeFromArray(hoverNote, this.state.notes) });
        this.refreshSequencerNotes();
    }

    startDragging(ringToDrag) {
        const { x, y } = this.state.mousePos;
        const angle = Math.PI - Math.atan2(x, y);
        this.setState({ draggingRing: ringToDrag, ringStartDragAngle: angle });
    }

    onMouseDown(event) {
        event.preventDefault();
        event.stopPropagation();
        if (event.button !== 0) return;

        const hoverNote = this.hoveringOverNote;
        if (hoverNote) {
            const notes = removeFromArray(hoverNote, this.state.notes);
            this.setState({ draggingNote: hoverNote, notes })
        } else if (this.state.canDragRing) {
            const ringToDrag = this.closestRing();
            if (ringToDrag) this.startDragging(ringToDrag);
        } else this.addNoteHere()
    }

    clearAll() {
        this.setState({notes: []});
        this.audio.clearAll();
    }

    setBeatsPerMeasure(beatsPerMeasure) {
        beatsPerMeasure = Math.floor(beatsPerMeasure);
        this.setState({ beatsPerMeasure });
        this.audio.timeSignature = beatsPerMeasure;
    }

    setBpm(bpm) {
        bpm = Math.floor(bpm);
        this.setState({ bpm });
        this.audio.bpm = bpm;
    }

    async addNoteHere(note) {
        const closestPoint = this.getClosestPointToMouse(true);
        const { coords: { x, y }, ring } = closestPoint;
        const angle = Math.PI - Math.atan2(x - SIZE/2, y - SIZE/2);
        await this.addNoteAt(ring, angle, x, y, note);
    }

    async onMouseUp() {
        if (!(this.state.draggingNote || this.state.draggingRing)) return;
        const note = this.state.draggingNote;
        if (this.state.draggingNote) await this.addNoteHere(note);
        else if (this.state.draggingRing) await this.stopDraggingRing();
        await this.setState({ draggingNote: null });
        this.refreshSequencerNotes();
    }
    
    stopDraggingRing() {
        let angleDiff = this.getAngleAtMouse() - this.state.ringStartDragAngle;
        console.log(angleDiff);
        let newAngle = angleDiff;
        if (this.state.snap) {
            const distanceRoundCircle = newAngle / 2 / Math.PI;
            const steps = this.state.beatsPerMeasure * 4;
            const roundedDistance = Math.round(distanceRoundCircle * steps) / steps;
            newAngle = Math.PI * 2 * roundedDistance;
        }
        this.rotateRingBy(this.state.draggingRing, newAngle);
        return this.setState({ canDragRing: false, draggingRing: null });
    }
    
    async rotateRingBy(selectedRing, angleDiff) {
        const newNotes = this.state.notes.map(note => {
            if (note.ring !== selectedRing) return note;
            const angle = note.angle + angleDiff;
            const radius = this.radiusOfRing(note.ring);
            const x = SIZE/2 + radius * Math.sin(angle);
            const y = SIZE/2 + -radius * Math.cos(angle);
            return { ...note, x, y, angle };
        });
        await this.setState({ notes: newNotes });
        this.refreshSequencerNotes();
    }

    onRightClick(event) {
        event.preventDefault();
        event.stopPropagation();
        this.removeNoteHere();
    }
    
    refreshSequencerNotes() {
        this.audio.clearAll();
        this.addAllAudioNotes();
    }

    get minBeatsPerMeasure() {
        let maxRing = 1;
        for (let { ring } of this.state.notes) {
            if (ring > maxRing) maxRing = ring;
        }
        return maxRing;
    }

    stop() {
        this.audio.stop();
        this.setState({ playing: false });
    }
    
    playPause() {
        this.audio.playPause();
        this.setState({ playing: this.audio.playing });
    }

    render() {
        console.log("Sequencer render with props playing of ", this.props.playing, "and state playing of", this.state.playing);
        return <div className="sequencer">
            <TextValue
                value={this.state.beatsPerMeasure}
                min={this.minBeatsPerMeasure}
                max={7}
                label={ "beats" }
                onChange={ beatsPerMeasure => this.setBeatsPerMeasure(beatsPerMeasure) } />
            <TextValue 
                value={ this.state.bpm } 
                min={10} max={200} 
                label={ "bpm" }
                onChange={ bpm => this.setBpm(bpm) }/>
            <canvas
                onMouseDown={ e => this.onMouseDown(e) }
                onMouseUp={ e => this.onMouseUp(e) }
                onMouseMove={ e => this.onMouseMove(e) }
                onContextMenu={ e => this.onRightClick(e) }
                id="canvas" width={ `${SIZE}px` } height={ `${SIZE}px` }
                ref={ this.canvas } />
            
            <div className="bottom-left-buttons">
                <button className="clear-all" onClick={ () => this.clearAll() }>
                    <FontAwesomeIcon icon={ [ "fas", "times" ]} />
                </button>
                <button className="stop" onClick={ () => this.stop() }>
                    <FontAwesomeIcon icon={ ["fas", "stop"] } />
                </button>
                <button className="playpause" onClick={ () => this.playPause() }>
                    { this.state.playing ?
                         <FontAwesomeIcon icon={ ["fas", "pause"] } />
                         : <FontAwesomeIcon icon={ ["fas", "play"] } /> }
                </button>
            </div>
            
            
            <MPCDrumSelector 
                value={ this.state.selectedDrum } 
                onChange={ selectedDrum => this.setState({ selectedDrum })} 
                colours={ COLOURS }
                />
            <Toggle className="lock" value={ this.state.snap }
                onChange={ () => this.setState({ snap: !this.state.snap })} />
        </div>;
    }
}