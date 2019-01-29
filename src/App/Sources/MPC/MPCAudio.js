import uuid from "uuid4";

const NUMBER_PADS = 16;

const NOTE_OFF = 128;
const NOTE_ON = 144;

const CONTROLLER_NOTE_OFFSET = -36;


export default class MPCAudio {
    
    constructor(parentRack) {
        this._pads = new Array(NUMBER_PADS);
        this._pads.fill(false);
        this.parentRack = parentRack;
        this.context = parentRack.appAudio.context;
        this.node = this.context.createGain();
        this.node.connect(parentRack.startOfFxChain);
        this.futureSounds = [];
    }
    
    play() {
        // console.log("MPCAudio received signal to play; ignoring.");
    }

    pause() {
        // console.log("MPCAudio received signal to pause; ignoring.");
    }

    padIndexOf(note) {
        return (NUMBER_PADS - 1) - (note + CONTROLLER_NOTE_OFFSET)
    }

    scheduleNotes(midiMessages) {
        // console.log("Scheduling...", midiMessages);
        for (let { data: [messageType, note], time } of midiMessages) {
            if (messageType === NOTE_ON) {
                const padIndex = this.padIndexOf(note);
                this.playPadAtTime(padIndex, time);
            }
        }
    }

    midiMessage(message) {
        console.log(message.data);
        const lightPad = this.lightPad || (() => {});
        const { data: [messageType, note] } = message;
        const padIndex = this.padIndexOf(note);
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
        const { node } = this.futureSounds.find(n => n.id === id);
        node.stop();
        node.disconnect();
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
        const { buffer } = this._pads[index];
        const node = this.context.createBufferSource();
        node.buffer = buffer;
        node.connect(this.node);
        node.start(time);
        const id = uuid();
        this.futureSounds.push({ id, node})
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
}