class EffectAudio {
    constructor(parentRack) {
        this.parentRack = parentRack;
        this.context = parentRack.appAudio.context;
        this.wetNode = this.context.createGain();
        this.dryNode = this.context.createGain();
        this.dryNode.gain.setValueAtTime(0, 0);
        this._wet = 1;
        this.input = this.context.createGain();
        this.input.connect(this.dryNode);
    }

    disconnect() {
        this.wetNode.disconnect();
        this.dryNode.disconnect();
        this.node.disconnect();
    }

    set wet(value) {
        this._wet = value;
        this.wetNode.gain.setValueAtTime(value, 0);
        this.dryNode.gain.setValueAtTime(1-value, 0);
    }
    
    get wet() {
        return this._wet;
    }

    routeTo(destination) {
        if (destination.input) {
            destination = destination.input;
        }
        this.input.connect(this.node);
        this.wetNode.disconnect();
        this.node.connect(this.wetNode);
        this.wetNode.connect(destination)

        this.dryNode.disconnect();
        this.dryNode.connect(destination);
    }
}


export default EffectAudio;