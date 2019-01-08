import uuid from "uuid4";
import React from "react";


class AudioGraph {

    async makeContext() {
        if (this.state.context) return this.state.context;
        const context = new (window.AudioContext || window.webkitAudioContext)();

        // Unlock audio context for iOS devices.
        if (context.state === 'suspended' && 'ontouchstart' in window) {
            await context.resume();
        }

        return context;
    }

    async makeRack() {
        const context = await this.makeContext();
        return { context, key: uuid(), ref: React.createRef() };
    }
}


export default AudioGraph;