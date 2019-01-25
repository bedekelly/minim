import uuid from "uuid4";

import RackAudio from './Rack/RackAudio';


class AppAudio {

    constructor() {
        this.racks = {};
        this.sources = {};
        this.effects = {};
        this.components = {};
        this.context = null;
        this.midiHandlers = {};
        this.selectedRack = null;
        this.learningMidi = false;
        this.midiLearnTarget = null;
        this.setupMidi();
    }

    onMidiMessage(input, message) {
        let control, value;
        let isControlMessage = (message.data[0] >> 4 !== 11)
        if (isControlMessage) {
            control = message.data[1];
            value = message.data[2];
        }

        if (isControlMessage && this.learningMidi) {
            // Assign the control to the current midi learn target.
            if (this.midiHandlers[input.id] === undefined) this.midiHandlers[input.id] = {};
            this.midiHandlers[input.id][control] = this.midiLearnTarget;
            
            // Reset our state so controllers work normally again.
            this.learningMidi = false;
            this.midiLearnTarget = null;
        } else if (isControlMessage && this.midiHandlers[input.id] && this.midiHandlers[input.id][control]) {
            const { id, handler } = this.midiHandlers[input.id][control];
            this.components[id][handler](value);
        } else {
            const rack = this.racks[this.selectedRack];
            rack && rack.midiMessage(message)
        }
    }


    registerComponent(id, handlers) {
        this.components[id] = handlers;
    }

    unregisterComponent(componentId) {
        for (let input of Object.keys(this.midiHandlers)) {
            for (let control of Object.keys(this.midiHandlers[input])) {
                const handler = this.midiHandlers[input][control]
                if (handler.id === componentId ) {
                    delete this.midiHandlers[input][control];
                }
            }
        }
        delete this.components[componentId];
    }

    async setupMidi() {
        const midiAccess = await navigator.requestMIDIAccess({ sysex: false })
        for (let input of midiAccess.inputs.values()) {
            input.onmidimessage = message => this.onMidiMessage(input, message);
        }
    }
    
    midiLearn(id, handler) {
        this.learningMidi = true;
        this.midiLearnTarget = { id, handler };
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
        this.selectedRack = id;
        return { id };
    }
}


export default AppAudio;