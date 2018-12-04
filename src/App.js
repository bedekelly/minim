import React, {Component} from 'react';
import uuid from "uuid4";
import './App.css';
import Rack from "./Rack/Rack";


class App extends Component {

    constructor(props) {
        super(props);
        this.state = { racks: [], context: null, playing: false }
    }

    async makeContext() {
        if (this.state.context) return this.state.context;
        const context = new (window.AudioContext || window.webkitAudioContext)();

        // Unlock audio context for iOS devices.
        if (context.state === 'suspended' && 'ontouchstart' in window) {
            await context.resume();
        }

        await this.setState({...this.state, context});
        window.globalContext = context;
        return context;
    }

    async makeRack() {
        const context = await this.makeContext();
        return { context, key: uuid(), ref: React.createRef() };
    }

    async addRack() {
        const rack = await this.makeRack();
        return this.setState({ ...this.state, racks: [ ...this.state.racks, rack ] })
    }

    async playAll() {
        for (let { ref: { current: rack } } of this.state.racks) {
            rack.play();
        }
        return this.setState({ ...this.state, playing: true });
    }

    async stopAll() {
        for (let { ref: { current: rack } } of this.state.racks) {
            rack.stop();
        }
        return this.setState({ ...this.state, playing: false });
    }

    render() {
        return <section className="app">
            <button className="add-rack" onClick={() => this.addRack()}>Add Rack</button>

            { this.state.racks.map(
                ({ key, context, ref }) =>
                    <Rack key={ key } context={ context }
                          playing={ this.state.playing } ref={ ref }/>
            ) }

            { this.state.playing
                ? <button className="stop-all" onClick={() => this.stopAll()}>Stop All</button>
                : <button className="play-all" onClick={() => this.playAll()}>Play All</button> }
        </section>;
    }
}


export default App;
