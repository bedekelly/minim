import uuid from "uuid4";

import AudioRack from './AudioRack';


class AudioGraph {

    constructor() {
        this.racks = {};
        this.sources = {};
        this.effects = {};
        this.context = null;
    }

    play() {
        for (let source of Object.values(this.sources)) {
            source.play();
        }
    }

    pause() {
        for (let source of Object.values(this.sources)) {
            source.pause();
        }
    }

    async initialise() {
        return await this.makeContext();
    }

    async makeContext() {
        if (this.context) return this.context;
        const context = new (window.AudioContext || window.webkitAudioContext)();

        // Unlock audio context for iOS devices.
        if (context.state === 'suspended' && 'ontouchstart' in window) {
            await context.resume();
        }

        this.context = context;
    }
    
    async makeRack() {
        const rack = new AudioRack(this);
        const id = uuid();
        this.racks[id] = rack;
        return { id };
    }
    
    
    
    // 
    // setPlaybackRate(rate) {
    //     this.state.player.sourceNode.playbackRate.setValueAtTime(rate, 0);
    //     return this.setState({...this.state, player: {...this.state.player, playbackRate: rate}});
    // }
    // 
    // async addEffectBefore(component, node, destination) {
    //     // Get last effect, or if not present, the player's output.
    //     const previousEffect = this.state.effects[this.state.effects.length - 1];
    //     let previousNode;
    //     if (previousEffect) previousNode = previousEffect.node;
    //     else previousNode = this.state.player.sourceNode;
    // 
    //     // Disconnect its output.
    //     previousNode.disconnect();
    // 
    //     // Connect its output to the effect's input.
    //     previousNode.connect(node);
    // 
    //     // Connect the effect's output to the main output
    //     node.connect(destination);
    // 
    //     // Add effect in the right place in our effects list.
    //     this.setState({ ...this.state, effects: [...this.state.effects, { node, component }]});
    // }
    
    // async addFilter() {
    //     const { context } = this.props;
    //     const node = context.createBiquadFilter();
    //     const filter = <Filter context={ context } key={ uuid() } node={ node } />;
    //     await this.addEffectBefore(filter, node, context.destination);
    // }
    // 
    // async addGain() {
    //     const { context } = this.props;
    //     const node = context.createGain();
    //     // const gain = <Gain context={ context } key={ uuid() } node={ node }/>;
    //     await this.addEffectBefore(gain, node, context.destination);
    // }
    // 
    // async addPan() {
    //     const { context } = this.props;
    //     const node = context.createStereoPanner();
    //     const pan = <Pan context={ context } key={ uuid() } node={ node } />;
    //     await this.addEffectBefore(pan, node, context.destination);
    // }
    // 
    // async addBatcave() {
    //     const { context } = this.props;
    //     const node = context.createConvolver();
    //     const response = await fetch(batcaveWav);
    //     const arrayBuffer = await response.arrayBuffer();
    //     const prom = new Promise(resolve => context.decodeAudioData(arrayBuffer, resolve));
    //     node.buffer = await prom;
    //     const batcave = <Batcave context={ context } key={ uuid() } node={ node } />;
    //     await this.addEffectBefore(batcave,node, context.destination);
    // }
}


export default AudioGraph;