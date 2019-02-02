import uuid from "uuid4";

import RackAudio from './Rack/RackAudio';


/**
 * Linearly map a value from one range to another.
 */
function linMap(value, fromLower, fromUpper, toLower, toUpper) {
    const lowerRange = fromUpper - fromLower;
    const upperRange = toUpper - toLower;
    const magnitudeThroughLowerRange = (value - fromLower);
    const fractionThroughRange = magnitudeThroughLowerRange / lowerRange;
    const magnitudeThroughUpperRange = fractionThroughRange * upperRange;
    const valueInUpperRange = toLower + magnitudeThroughUpperRange;
    return valueInUpperRange;
}


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
        let isControlMessage = (message.data[0] >> 4 === 11)
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
            const { id, handler, min, max } = this.midiHandlers[input.id][control];
            if (min !== undefined && max !== undefined) {
                value = linMap(value, 0, 127, min, max);
            }
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
    
    midiLearn(id, handler, min, max) {
        this.learningMidi = true;
        this.midiLearnTarget = { id, handler, min, max };
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