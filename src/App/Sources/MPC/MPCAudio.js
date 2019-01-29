export default class MPCAudio {
    
    constructor(parentRack) {
        this._pads = new Array(16);
        this._pads.fill(false);
        this.parentRack = parentRack;
        this.context = parentRack.appAudio.context;
        this.node = this.context.createGain();
        this.node.connect(parentRack.startOfFxChain);
    }
    
    play() {
        console.log("MPCAudio received signal to play; ignoring.");
    }
    
    pause() {
        console.log("MPCAudio received signal to pause; ignoring.");
    }
    
    midiMessage(message) {
        const lightPad = this.lightPad || (() => {});
        const { data } = message;
        const padIndex = 15 - (data[1] - 36);
        if (data[0] === 128) {
            lightPad(padIndex, false);
        } else if (data[0] === 144) {
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
    
    playPad(index) {
        console.log("Playing pad " + index);
        if (!this._pads[index]) return;
        const { buffer } = this._pads[index];
        const node = this.context.createBufferSource();
        node.buffer = buffer;
        node.connect(this.node);
        node.start(0);
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