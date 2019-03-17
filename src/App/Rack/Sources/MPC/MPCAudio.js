import uuid from "uuid4";
import Samples from './Samples';

const NUMBER_PADS = 16;

const NOTE_OFF = 128;
const NOTE_ON = 144;

const CONTROLLER_NOTE_OFFSET = -36;


export default class MPCAudio {
    
    // Work around a bug with minification.
    name = "MPCAudio";
    
    constructor(parentRack) {
        this._pads = new Array(NUMBER_PADS);
        this._pads.fill(false);
        this.parentRack = parentRack;
        this.context = parentRack.appAudio.context;
        this.node = this.context.createGain();
        this.node.connect(parentRack.startOfFxChain);
        this.futureSounds = [];
        this.loadInitialSounds();
        this.lightPad = null;

        this.hold = true;
    }
    
    static padIndexOf(note) {
        return (NUMBER_PADS - 1) - (note + CONTROLLER_NOTE_OFFSET)
    }

    loadFromTapeLooper({loopStart, loopEnd, playbackRate, buffer}, index) {
        this._pads[index] = { buffer, loopStart, loopEnd, playbackRate }
    }

    scheduleNotes(midiMessages) {
        for (let { data: [messageType, note], time } of midiMessages) {
            if (messageType === NOTE_ON) {
                const padIndex = MPCAudio.padIndexOf(note);
                this.playPadAtTime(padIndex, time);
            }
        }
    }

    loadInitialSounds() {
        const promises = [];

        Object.values(Samples).forEach((url, index) => {
            const loadSound = async (url, index) => {
                try {
                    const response = await fetch(url);
                    const arrayBuffer = await response.arrayBuffer();
                    await this.loadBufferToPad(arrayBuffer, 15-index)
                } catch (e) { console.warn(e); }
            };
            promises.push(loadSound(url, index));
        });

        Promise.all(promises).then(() => this.loaded = true);
    }

    midiMessage(message) {
        const lightPad = this.lightPad || (() => {});
        const { data: [messageType, note] } = message;
        const padIndex = MPCAudio.padIndexOf(note);
        if (messageType === NOTE_OFF) {
            lightPad(padIndex, false);
            if (!this.hold) this.stopPad(padIndex);
        } else if (messageType === NOTE_ON) {
            this.playPad(padIndex);
            lightPad(padIndex, true);
        }
    }

    noteOnAtTime(note, time) {
        const index = MPCAudio.padIndexOf(note);
        return this.playPadAtTime(index, time);
    }

    noteIDOffAtTime(id, time) {
        if (!this.hold) return this.stopPadWithIDAtTime(id, time);
    }

    async loadBufferToPad(encodedBuffer, index) {
        const context = this.context;
        const prom = new Promise(resolve => {
            context.decodeAudioData(encodedBuffer, resolve);
        });
        const buffer = await prom;
        this._pads[index] = { buffer };
    }

    get pads() {
        return this._pads.map((i, index) => {
            if (i) return i;
            return { play: () => console.log(`Pad ${index} has no audio`) }
        });
    }

    removeNodeWithId(id) {
        const sound = this.futureSounds.find(n => n.id === id);
        if (sound) {
            console.log("Removing node", sound);
            sound.node.stop();
            sound.node.disconnect();
        }
        this.futureSounds = this.futureSounds.filter(n => n.id !== id);
    }
    
    cancelAllNotes() {
        for (let { node } of this.futureSounds) {
            node.stop();
            node.disconnect();
        }
        this.futureSounds = [];
    }

    playPadAtTime(index, time) {
        if (!this._pads[index]) return;
        const { buffer, playbackRate, loopStart, loopEnd } = this._pads[index];
        const node = this.context.createBufferSource();
        node.buffer = buffer;
        node.connect(this.node);
        const duration = loopEnd - loopStart || buffer.duration;

        if (playbackRate) {
            node.playbackRate.setValueAtTime(playbackRate, time);
            node.start(time, loopStart, duration);
        } else {
            node.start(time);
        }
        
        const id = uuid();
        const stopTime = time + duration;
        this.futureSounds.push({ id, node, index, stopTime });
        node.onended = () => this.removeNodeWithId(id);
        return id;
    }

    stopPadWithIDAtTime(id, time) {
        for (let sound of this.futureSounds) {
            if (sound.id !== id) continue;
            if (sound.stopTime <= time) continue;
            console.log(`stopPadWithIDAtTime(id=${id}, time=${time}, sound.stopTime=${sound.stopTime}, currentTime=${this.context.currentTime})`);
            sound.node.stop(time);
        }
    }

    playPad(index) {
        this.playPadAtTime(index, 0);
    }

    stopPad(index) {
        for (let sound of this.futureSounds) {
            if (sound.index !== index) continue;
            this.removeNodeWithId(sound.id);
        }
    }

    routeTo(destination) {
        if (destination.input) {
            destination = destination.input;
        }
        this.destination = destination;
        if (this.node) {
            this.node.disconnect();
            this.node.connect(destination);
        }
    }

    toggleHold() {
        this.hold = !this.hold;
    }

    stop() {
        for (let { node } of this.futureSounds) {
            node.disconnect();
        }
    }
}