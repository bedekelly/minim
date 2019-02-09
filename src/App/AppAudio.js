import uuid from "uuid4";

import RackAudio from './Rack/RackAudio';


class AppAudio {

    constructor() {
        this.racks = {};
        this.sources = {};
        this.effects = {};
        this.midiControlledComponents = {};
        this.context = null;
        this.componentMidiHandlers = {};
        this.selectedRack = null;
        this.learningMidi = false;
        this.midiLearnTarget = null;
        this.setupMidi();
    }

    onMidiMessage(input, message) {
        let control, value;
        let isControlMessage = (message.data[0] >> 4 === 11)
        if (isControlMessage) {
            control = message.data[1];
            value = message.data[2];
        }

        // Currently learn MIDI, so swallow the next component input.
        if (isControlMessage && this.learningMidi) {
            // Assign the control to the current midi learn target.
            if (this.midiControlledComponents[input.id] === undefined) 
                this.midiControlledComponents[input.id] = {};
            this.midiControlledComponents[input.id][control] = this.midiLearnTarget;

            // Reset our state so controllers work normally again.
            this.learningMidi = false;
            this.midiLearnTarget = null;
        } 

        // Control has been MIDI-learned, so delegate to the component's handler.
        else if (isControlMessage && this.midiControlledComponents[input.id] && this.midiControlledComponents[input.id][control]) {
            const componentId = this.midiControlledComponents[input.id][control];
            const handler = this.componentMidiHandlers[componentId];
            handler(value);
        } 
        
        // Otherwise, just send the MIDI message to the current rack.
        else {
            const rack = this.racks[this.selectedRack];
            rack && rack.midiMessage(message)
        }
    }

    registerHandler(componentId, handler) {
        this.componentMidiHandlers[componentId] = handler;
    }

    unregisterAllHandlers(componentId) {
        console.warn("Unregistering handlers not implemented");
        // Todo: loop through all handlers with IDs starting with the
        // given ID, and unregister them.
        
        /*
        for (let input of Object.keys(this.midiHandlers)) {
            for (let control of Object.keys(this.midiHandlers[input])) {
                const handler = this.midiHandlers[input][control]
                if (handler.id === componentId ) {
                    delete this.midiHandlers[input][control];
                }
            }
        }
        delete this.components[componentId];
        */
    }

    async setupMidi() {
        const midiAccess = await navigator.requestMIDIAccess({ sysex: false })
        for (let input of midiAccess.inputs.values()) {
            input.onmidimessage = message => this.onMidiMessage(input, message);
        }
    }
    
    midiLearn(componentId) {
        this.learningMidi = true;
        this.midiLearnTarget = componentId;
    }

    play() {
        for (let source of Object.values(this.racks)) {
            source.play();
        }
    }

    pause() {
        for (let source of Object.values(this.racks)) {
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
    
    selectRack(id) {
        this.selectedRack = id;
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