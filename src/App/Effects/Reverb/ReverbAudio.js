import EffectAudio from '../EffectAudio';

const sounds = "https://s3.eu-west-2.amazonaws.com/static-electricity/sounds/";
const images = "https://s3.eu-west-2.amazonaws.com/static-electricity/daw/images/";

const reverb = name => ({ sound: sounds + name + ".wav", image: images + name + ".jpg" });
const reverbs = [ "Quarry", "Ambience", "Cavern", "CrystalPlate", 
                   "HugeCarPark", "LargeHall" ].map(reverb);


class ReverbAudio extends EffectAudio {

    constructor(parentRack) {
        super(parentRack);
        this.node = this.context.createConvolver();
        this._value = 0;
        this.loaded = false;
        this.reverbs = reverbs;
        this.index = 0;
        this.loadAllFiles();
    }

    get image() {
        return this.reverbs[this.index].image;
    }

    changeIndex(diff) {
        this.index += diff;
        if (this.index < 0) this.index += this.reverbs.length;
        this.index %= this.reverbs.length;
        const buffer = this.reverbs[this.index].buffer;
        this.node.buffer = buffer;
    }

    static async fetchAndLoadAudio(location, context) {
        try {
            const response = await fetch(location);
            const arrayBuffer = await response.arrayBuffer();
            return await context.decodeAudioData(arrayBuffer);
        } catch (e) {
            console.log(e);
        }
    }

    async loadAllFiles() {
        const that = this;
        const filesLoaded = this.reverbs.map(async ({ sound, image }, index) => {
            console.log("Starting to load buffer for ", index);
            const buffer = await ReverbAudio.fetchAndLoadAudio(sound, that.context);
            console.log("Loaded buffer for ", index);
            that.reverbs[index] = { sound, image, buffer };

            if (index === 0) {
                that.node.buffer = buffer;
            }
        })
        await Promise.all(filesLoaded);
        console.log("All files loaded!");
    }
}


export default ReverbAudio;