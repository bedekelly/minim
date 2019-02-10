class EffectAudio {
    constructor(parentRack) {
        this.parentRack = parentRack;
        this.context = parentRack.appAudio.context;
        this.appAudio = parentRack.appAudio;
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
        if (this.node) this.node.disconnect();
        else this.outputNode.disconnect()
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
        if (this.inputNode && this.outputNode) {
            this.input.connect(this.inputNode);
            this.outputNode.connect(this.wetNode);
        }
        else if (this.node) {
            this.input.connect(this.node);
            this.node.connect(this.wetNode);
        } else {
            console.warn("Not a single-node or double-node effect")
        }


        this.wetNode.disconnect();
        this.wetNode.connect(destination);

        this.dryNode.disconnect();
        this.dryNode.connect(destination);
    }
    
    temporaryDry() {
        this.oldWet = this.wet;
        this.wet = 0;
    }
    
    temporaryDryOff() {
        this.wet = this.oldWet;
    }
}


export default EffectAudio;