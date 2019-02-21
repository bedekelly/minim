const BUFFER_URL = name => 
    `https://s3.eu-west-2.amazonaws.com/static-electricity/daw/ambience-sounds/${name.replace(" ", "+")}.wav`;
const SCHEDULING_WINDOW = 4;
const CROSSOVER = 2;


export default class AmbienceAudio {
    
    SOUNDS = ["Wind", "Record Crackle", "Rainstorm"]
    
    constructor(parentRack) {
        this.soundBuffers = {};
        this.parentRack = parentRack;
        this.appAudio = parentRack.appAudio;
        this.paused = true;
        this.context = this.appAudio.context;
        this.outputNode = this.context.createGain();
        this.sourceNodes = [];
        this.currentSound = 0;
        this.loaded = false;
    }
    
    get sound() {
        return this.SOUNDS[this.currentSound];
    }
    
    nextIndex() {
        return (this.currentSound + 1) % this.SOUNDS.length;
    }
    
    previousIndex() {
        const newIndex = (this.currentSound - 1);
        return newIndex < 0 ? newIndex + this.SOUNDS.length : newIndex;
    }

    next() {
        this.cleanup({ allSounds: true });
        this.currentSound = this.nextIndex();
        this.play();
        return this.SOUNDS[this.currentSound];
    }

    previous() {
        this.cleanup({ allSounds: true });
        this.currentSound = this.previousIndex();
        this.play();
        return this.SOUNDS[this.currentSound];
    }
    
    async fetchAndLoadAudio(location) {
        try {
            const response = await fetch(location);
            const arrayBuffer = await response.arrayBuffer();
            return await this.context.decodeAudioData(arrayBuffer);
        } catch (e) {
            console.warn(e);
        }
    }

    get currentBuffer() {
        return this.soundBuffers[this.currentSound];
    }

    async loadSoundBuffer(index) {
        if (this.soundBuffers[index]) return;
        const name = this.SOUNDS[index];
        if (name === undefined) debugger;
        const url = BUFFER_URL(name);
        this.soundBuffers[index] = await this.fetchAndLoadAudio(url);
        return this.soundBuffers[index];
    }

    startScheduling() {
        this.interval = setInterval(this.scheduleNextSound.bind(this), 2000);
    }

    shouldScheduleSound(now, start, length) {
        return (now > (start + length - CROSSOVER - SCHEDULING_WINDOW));
    }

    scheduleNextSound() {
        const now = this.context.currentTime;
        const start = this.startTime;
        const length = this.currentBuffer.duration;
        if (this.shouldScheduleSound(now, start, length)) {
            this.playAt(start + length - CROSSOVER);
        }
        this.cleanup({ allSounds: false });
    }

    cleanup({ allSounds }) {
        this.sourceNodes = this.sourceNodes.filter(({sourceNode, gainNode, endTime}) => {
            if (allSounds || this.context.currentTime > endTime) {
                sourceNode.disconnect();
                gainNode.disconnect();
                return false;
            }
            else { 
                return true;
            }
        })
    }

    playAt(time) {
        const sourceNode = this.context.createBufferSource();
        const buffer = sourceNode.buffer = this.currentBuffer;
        if (buffer === undefined) console.log({ thisCurrentSound: this.currentSound, sounds: this.SOUNDS, thisSoundBuffers: this.soundBuffers });
        sourceNode.start(time);
        
        const gainNode = this.context.createGain();
        sourceNode.connect(gainNode);
        gainNode.connect(this.outputNode);
        
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.setTargetAtTime(1, time, CROSSOVER / 3);
        const endTime = time + buffer.duration;
        gainNode.gain.setTargetAtTime(0, endTime - CROSSOVER, CROSSOVER / 3);
        
        this.startTime = time;
        this.sourceNodes.push({sourceNode, gainNode, endTime});
    }

    async play() {
        await this.loadSoundBuffer(this.currentSound);
        this.playAt(0);
        this.startScheduling();
        const promises = [];
        for (let i=0; i<this.SOUNDS.length; i++) { promises.push(this.loadSoundBuffer(i)) };
        await Promise.all(promises);
        this.loaded = true;
    }

    routeTo(destination) {
        if (destination.input) {
            destination = destination.input;
        }
        this.outputNode.disconnect();
        this.outputNode.connect(destination);
        
    }
}
