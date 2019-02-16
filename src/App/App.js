import React, {Component} from 'react';
import "stereo-panner-shim";
import viewportFix from "viewport-units-buggyfill";

import Rack from "./Rack";
import AppAudio from './AppAudio';

import './App.css';


viewportFix.init();


/**
 * Main "App" component responsible for rendering and controlling the whole webapp.
 */
class App extends Component {

    processors = [ "bit-crusher" ];

    constructor(props) {
        super(props);
        this.appAudio = new AppAudio();
        this.state = { loaded: false, racks: [], playing: false, selectedRack: this.appAudio.selectedRack }
    }
    
    async initialise() {
        if (this.state.loaded) return;
        await this.appAudio.initialise();
        await this.loadProcessors();
        await this.setState({loaded: true});
    }

    async loadProcessors() {
        for (let worklet of this.processors) {
            // Todo: use Promise.all() here to allow asynchronous loading.
            await this.appAudio.context.audioWorklet.addModule(`worklets/${worklet}.js`);
        }
    }

    async addRack() {
        await this.initialise();
        const rack = await this.appAudio.makeRack();
        this.selectRack(rack.id);
        return this.setState({ racks: [ ...this.state.racks, rack ] })
    }

    playAll() {
        if (this.state.playing) return;
        this.appAudio.play();
        this.setState({playing: true})
    }

    pauseAll() {
        if (!this.state.playing) return;
        this.appAudio.pause();
        this.setState({playing: false});
    }
    
    selectRack(id) {
        this.setState({ selectedRack: id });
        this.appAudio.selectRack(id);
    }
    
    get selectedRack() {
        return this.state.selectedRack;
    }
    
    deleteRack(id) {
        this.appAudio.deleteRack(id);
        this.setState({
            racks: this.state.racks.filter(r => r.id !== id)
        })
    }

    render() {
        return <section className="app">
            <button className="add-rack" onClick={() => this.addRack()}>+ Rack</button>
            { this.state.racks.map(rack => 
                <Rack 
                    key={rack.id} id={rack.id} appAudio={this.appAudio} 
                    selected={ this.state.selectedRack === rack.id }
                    playing={this.state.playing} select={() => this.selectRack(rack.id)}
                    deleteSelf={ () => this.deleteRack(rack.id) }>
                </Rack>
            ) }
            <button className="play-all" onMouseDown={() => this.playAll()}>Play All</button>
            <button className="pause-all" onClick={() => this.pauseAll()}>Pause All</button>
        </section>;
    }
}


export default App;
