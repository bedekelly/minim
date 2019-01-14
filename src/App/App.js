import React, {Component} from 'react';
import "stereo-panner-shim";
import viewportFix from "viewport-units-buggyfill";

import Rack from "./Rack";
import AudioGraph from './AudioGraph';

import './App.css';


viewportFix.init();


/**
 * Main "App" component responsible for rendering and controlling the whole webapp.
 */
class App extends Component {

    constructor(props) {
        super(props);
        this.state = { racks: [], playing: false }
        this.audioGraph = new AudioGraph();
        this.state = { loaded: false, racks: [] }
    }

    async initialise() {
        if (this.state.loaded) return;
        await this.audioGraph.initialise();
        await this.setState({loaded: true});
    }

    async addRack() {
        await this.initialise();
        const rack = await this.audioGraph.makeRack();
        return this.setState({ racks: [ ...this.state.racks, rack ] })
    }

    playAll() {
        if (this.state.playing) return;
        this.audioGraph.play();
        this.setState({playing: true})
    }

    pauseAll() {
        if (!this.state.playing) return;
        this.audioGraph.pause();
        this.setState({playing: false});
    }

    render() {
        return <section className="app">
            <button className="add-rack" onClick={() => this.addRack()}>Add Rack</button>
            { this.state.racks.map(rack => 
                <Rack 
                    key={rack.id} id={rack.id} audioGraph={this.audioGraph} 
                    playing={this.state.playing}>
                </Rack>
            ) }
        
            <button className="play-all" onMouseDown={() => this.playAll()}>Play All</button>
            <button className="pause-all" onClick={() => this.pauseAll()}>Pause All</button>
        </section>;
    }
}


export default App;
