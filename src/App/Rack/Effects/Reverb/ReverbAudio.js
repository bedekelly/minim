import EffectAudio from '../EffectAudio';

import QuarryImpulse from './Impulses/Quarry.wav';
import AmbienceImpulse from './Impulses/Ambience.wav';
import CavernImpulse from './Impulses/Cavern.wav';
import CrystalPlateImpulse from './Impulses/CrystalPlate.wav';
import HugeCarParkImpulse from './Impulses/HugeCarPark.wav';
import LargeHallImpulse from './Impulses/LargeHall.wav';

import QuarryPic from './Images/Quarry.jpg'
import AmbiencePic from './Images/Ambience.jpg';
import CavernPic from './Images/Cavern.jpg';
import CrystalPlatePic from './Images/CrystalPlate.jpg';
import HugeCarParkPic from './Images/HugeCarPark.jpg';
import LargeHallPic from './Images/LargeHall.jpg';

const reverbs = [
    { sound: QuarryImpulse, image: QuarryPic },
    { sound: AmbienceImpulse, image: AmbiencePic },
    { sound: CavernImpulse, image: CavernPic },
    { sound: CrystalPlateImpulse, image: CrystalPlatePic },
    { sound: HugeCarParkImpulse, image: HugeCarParkPic },
    { sound : LargeHallImpulse, image: LargeHallPic }
];


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
            const buffer = await ReverbAudio.fetchAndLoadAudio(sound, that.context);
            that.reverbs[index].buffer = buffer;
            if (index === 0) {
                that.node.buffer = buffer;
            }
        });
        await Promise.all(filesLoaded);
        console.log("All files loaded!");
    }
}


export default ReverbAudio;