class PanAudio {
    constructor(parentRack) {
        this.parentRack = parentRack;
        this.context = parentRack.graph.context;
        this.node = this.context.createStereoPanner();
    }
    
    setValue(value) {
        this.node.pan.setValueAtTime(value, 0);
    }
    
    routeTo(destination) {
        this.node.disconnect();
        this.node.connect(destination);
    }
}


export default PanAudio;