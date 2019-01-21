import uuid from 'uuid4';


export default class RiceAudio {
    constructor(parentRack) {
        this.parentRack = parentRack;
        this.graph = parentRack.graph;
        this.context = this.graph.context;
    }

    async gotEncodedBuffer(encodedBuffer) {
        const context = this.context;
        const decode = new Promise(resolve => {
            context.decodeAudioData(encodedBuffer, resolve);
        });
        this.buffer = await decode;
        this.audioId = uuid();
    }

    routeTo(destination) {
        console.log("Rice audio routed to ", destination);
    }
}