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
        this.learningMidi = false;
        this.midiLearnTarget = null;
        this.setupMidi();
    }

    onMidiMessage(input, message) {
        if (message.data[0] >> 4 !== 11) {
            console.log("Non-control message, returning.");
        }

        const control = message.data[1];
        const value = message.data[2];

        if (this.learningMidi) {
            // Assign the control to the current midi learn target.
            if (this.midiHandlers[input.id] === undefined) this.midiHandlers[input.id] = {};
            this.midiHandlers[input.id][control] = this.midiLearnTarget;
            
            // Reset our state so controllers work normally again.
            this.learningMidi = false;
            this.midiLearnTarget = null;

        } else {
            if (!this.midiHandlers[input.id] || !this.midiHandlers[input.id][control]) {
                console.log("Unhandled midi input: ", { input: input.id, control });
                return;
            }
            const { id, handler } = this.midiHandlers[input.id][control];
            this.components[id][handler](value);
        }
        // this.selectedRack.midi(message)
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
        return { id };
    }
}


export default AppAudio;