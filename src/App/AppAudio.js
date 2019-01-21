import uuid from "uuid4";

import RackAudio from './Rack/RackAudio';


class AppAudio {

    constructor() {
        this.racks = {};
        this.sources = {};
        this.effects = {};
        this.context = null;
        this.setupMidi();
    }

    async setupMidi() {
        const midiAccess = await navigator.requestMIDIAccess({ sysex: false })
        debugger;
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
        const rack = new RackAudio(this);
        const id = uuid();
        this.racks[id] = rack;
        return { id };
    }
}


export default AppAudio;