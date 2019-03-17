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
        } else if (messageType === NOTE_ON) {
            this.playPad(padIndex);
            lightPad(padIndex, true);
        }
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
            sound.node.stop();
            sound.node.disconnect();
        }
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

        if (playbackRate) {
            node.playbackRate.setValueAtTime(playbackRate, time);
            node.start(time, loopStart, loopEnd - loopStart);
        } else {
            node.start(time);
        }
        
        const id = uuid();
        this.futureSounds.push({ id, node});
        node.onended = () => this.removeNodeWithId(id);
    }

    playPad(index) {
        this.playPadAtTime(index, 0);
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
    
    stop() {
        for (let { node } of this.futureSounds) {
            node.disconnect();
        }
    }
}