class EffectAudio {
    constructor(parentRack) {
        this.parentRack = parentRack;
        this.context = parentRack.graph.context;
    }
    
    disconnect() {
        this.node.disconnect();
    }
    
    routeTo(destination) {
        if (destination.node) {
            destination = destination.node;
        }
        
        if (this.node) {
            this.node.disconnect();
            this.node.connect(destination);
        } else {
            console.warn("Tried to connect a node which doesn't exist!");
        }
    }
}


export default EffectAudio;