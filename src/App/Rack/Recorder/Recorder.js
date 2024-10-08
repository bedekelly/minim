import React from 'react';

import './Recorder.css';

import TextValue from 'Components/TextValue';
import { CrossIcon, PauseIcon, RecordIcon, PlayIcon, StopIcon } from '../../../Icons';


const MetronomeIcon = 
    "https://s3.eu-west-2.amazonaws.com/static-electricity/icons/MetronomeIcon.svg";


export default class Recorder extends React.Component {
    
    minBeatsPerMeasure = 1;
    
    constructor(props) {
        super(props);
        this.audio = this.props.audio;
        this.state = {
            bpm: this.audio.bpm,
            beatsPerMeasure: this.audio.beatsPerMeasure,
            playing: this.audio.playing,
            recording: this.audio.recording,
            metronome: false
        };
    }
    
    setBeatsPerMeasure(beatsPerMeasure) {
        this.setState({ beatsPerMeasure: Math.round(beatsPerMeasure) });
        this.props.audio.beatsPerMeasure = beatsPerMeasure;
    }
    
    setBpm(bpm) {
        this.setState({ bpm: Math.round(bpm) });
        this.props.audio.bpm = bpm;
    }
    
    togglePlaying() {
        this.setState({ playing: !this.state.playing });
        this.props.audio.togglePlaying();
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (this.props.reloadPlayState !== prevProps.reloadPlayState) {
            this.setState({ playing: this.audio.playing });
        }
    }
    
    metronomeButtonStyle() {
        if (this.state.metronome) {
            return {
                background: "lightgrey",
                color: "#222"
            }
        } else return {};
    }
    
    recordingButtonStyle() {
        if (this.state.recording) {
            return {
                background: "#ee2222",
                color: "whitesmoke"
            }
        }
    }
    
    toggleMetronome() {
        this.props.audio.toggleMetronome();
        this.setState({ metronome: !this.state.metronome });
    }
    
    toggleRecording() {
        this.setState({ recording: !this.state.recording });
        this.props.audio.toggleRecording();
    }
    
    stop() {
        this.setState({ playing: false });
        this.props.audio.stop();
    }
    
    clearAll() {
        this.props.audio.clearAll();
    }
    
    componentWillUnmount() {
        this.stop();
        this.clearAll();
    }
    
    render() {
        return <section className="recorder">
            <section className="timing">
                <TextValue 
                    value={this.state.beatsPerMeasure} 
                    min={this.minBeatsPerMeasure} 
                    max={ 32 } 
                    label={ "beats" }
                    onChange={ beatsPerMeasure => this.setBeatsPerMeasure(beatsPerMeasure) } />
                <TextValue 
                    value={this.state.bpm} 
                    min={10} max={200} 
                    label={ "bpm" }
                    onChange={ bpm => this.setBpm(bpm) }/>
            </section>
            <section className="controls">
                <button className="clear-all" onClick={ () => this.clearAll() }>
                    <CrossIcon />
                </button>
                <button className="stop" onMouseDown={ () => this.stop() }>
                    <StopIcon />
                </button>
                <button className="play-pause" onMouseDown={ () => this.togglePlaying() }>
                    {
                        this.state.playing ?
                        <PauseIcon />
                        : <PlayIcon />
                    }
                </button>
                <button className="record" style={ this.recordingButtonStyle() }
                        onMouseDown={ () => this.toggleRecording() }>
                    <RecordIcon />
                </button>
                <button className="metronome" style={ this.metronomeButtonStyle() } 
                        onMouseDown={ () => this.toggleMetronome() }>
                    <img src={ MetronomeIcon } alt=""/>
                </button>
            </section>
        </section>
    }
}