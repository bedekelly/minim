import React from "react";
import uuid from "uuid4";

import { Gain, Filter, Pan, TapeRecorder, Batcave } from "../Components";
import batcaveWav from '../Components/Batcave/Batcave.wav';

import './Rack.css';


class Rack extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            modifiers: [],
            player: null,
            effects: []
        };
    }

    async addFilter() {
        const { context } = this.props;
        const node = context.createBiquadFilter();
        const filter = <Filter context={ context } key={ uuid() } node={ node } />;
        await this.addEffectBefore(filter, node, context.destination);
    }

    async addGain() {
        const { context } = this.props;
        const node = context.createGain();
        const gain = <Gain context={ context } key={ uuid() } node={ node }/>;
        await this.addEffectBefore(gain, node, context.destination);
    }

    async addPan() {
        const { context } = this.props;
        const node = context.createStereoPanner();
        const pan = <Pan context={ context } key={ uuid() } node={ node } />;
        await this.addEffectBefore(pan, node, context.destination);
    }

    async addBatcave() {
        const { context } = this.props;
        const node = context.createConvolver();
        const response = await fetch(batcaveWav);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await context.decodeAudioData(arrayBuffer);
        node.buffer = audioBuffer;
        const batcave = <Batcave context={ context } key={ uuid() } node={ node } />;
        await this.addEffectBefore(batcave,node, context.destination);
    }

    addTapeRecorder() {
        const sourceNode = this.props.context.createBufferSource();
        return this.setState({...this.state, player: { ref: React.createRef(), sourceNode, playbackRate: 1.0 }});
    }

    async storeBuffer(buffer) {
        await this.setState({...this.state, player: {...this.state.player, buffer}});
    }

    async storeBufferSourceNode(sourceNode) {
        await this.setState({...this.state, player: {...this.state.player, sourceNode}});
    }


    play() {
        // Imperatively play audio through the Player API.
        this.state.player.ref && this.state.player.ref.current.play();
    }

    stop() {
        this.state.player.ref && this.state.player.ref.current.stop();
    }

    getFirstDestination() {
        return (
            this.state.effects[0] ? this.state.effects[0].node : this.props.context.destination
        );
    }

    setPlaybackRate(rate) {
        this.state.player.sourceNode.playbackRate.setValueAtTime(rate, 0);
        return this.setState({...this.state, player: {...this.state.player, playbackRate: rate}});
    }

    async addEffectBefore(component, node, destination) {
        // Get last effect, or if not present, the player's output.
        const previousEffect = this.state.effects[this.state.effects.length - 1];
        let previousNode;
        if (previousEffect) previousNode = previousEffect.node;
        else previousNode = this.state.player.sourceNode;

        // Disconnect its output.
        previousNode.disconnect();

        // Connect its output to the effect's input.
        previousNode.connect(node);

        // Connect the effect's output to the main output
        node.connect(destination);

        // Add effect in the right place in our effects list.
        this.setState({ ...this.state, effects: [...this.state.effects, { node, component }]});
    }

    addTapeRecorderButton() {
        return (
            this.state.player
                ? null
                : <button onClick={() => this.addTapeRecorder()}>Add Tape Player</button>
        );
    }

    addFilterButton() {
        return (
            this.state.player
            ? <button onClick={() => this.addFilter()}>Muffle</button>
            : null
        );
    }

    addGainButton() {
        return (
            this.state.player
                ? <button onClick={() => this.addGain()}>Boost</button>
                : null
        );
    }

    addPanButton() {
        return (
            this.state.player
            ? <button onClick={() => this.addPan()}>Pan</button>
            : null
        );
    }

    addBatcaveButton() {
        return (
            this.state.player
                ? <button onClick={() => this.addBatcave()}>Batcave</button>
                : null
        );
    }

    renderTapeRecorder() {
        if (this.state.player) return <TapeRecorder
            context={ this.props.context }
            key={ uuid() }
            getFirstDestination={ () => this.getFirstDestination() }
            playing={ this.props.playing }
            storeBuffer={ buffer => this.storeBuffer(buffer) }
            storeBufferSourceNode={ sourceNode => this.storeBufferSourceNode(sourceNode) }
            buffer={ this.state.player.buffer }
            sourceNode={ this.state.player.sourceNode }
            ref={ this.state.player.ref }
            playbackRate={ this.state.player.playbackRate }
            setPlaybackRate={ rate => this.setPlaybackRate(rate) }
        />;
    }

    render() {
        return <section className={"rack"}>
            <div className="components-wrapper">
                <section className={"components"}>
                    { this.state.modifiers }
                    { this.renderTapeRecorder() }
                    { this.state.effects.map(({ component }) => component) }
                </section>
            </div>

            <section className="add-buttons">
                { this.addTapeRecorderButton() }
                { this.addFilterButton() }
                { this.addGainButton() }
                { this.addPanButton() }
                { this.addBatcaveButton() }
            </section>
        </section>
    }
}


export default Rack;