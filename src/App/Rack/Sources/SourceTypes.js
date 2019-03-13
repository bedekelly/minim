import GranularSynth from './GranularSynth';
import GranularSynthAudio from './GranularSynth/GranularSynthAudio'
import TapeLooper from './TapeLooper';
import TapeLooperAudio from './TapeLooper/TapeLooperAudio';
import MPC from './MPC';
import MPCAudio from './MPC/MPCAudio';
import Ambience from './Ambience';
import AmbienceAudio from './Ambience/AmbienceAudio';
import Synth from './Synth';
import SynthAudio from './Synth/SynthAudio';


const SourceType = Object.freeze({
    TapeLooper: Symbol("TapeLooper"),
    MPC: Symbol("MPC"),
    Synth: Symbol("Synth"),
    Ambience: Symbol("Ambience"),
    GranularSynth: Symbol("GranularSynth")
});


const SourceTypes = [
    { 
        type: SourceType.TapeLooper,
        text: "Tape Looper", 
        image: "https://lorempixel.com/300/240",
        component: TapeLooper,
        audio: TapeLooperAudio
    },
    {
        type: SourceType.MPC,
        text: "Drum Pads",
        image: "https://lorempixel.com/300/240",
        component: MPC,
        audio: MPCAudio
    },
    {
        type: SourceType.Synth,
        text: "Poly Synth",
        image: "https://lorempixel.com/300/240",
        component: Synth,
        audio: SynthAudio
    },
    {
        type: SourceType.Ambience,
        text: "Ambient Sounds",
        image: "https://lorempixel.com/300/240",
        component: Ambience,
        audio: AmbienceAudio
    },
    {
        type: SourceType.GranularSynth,
        text: "Granular Synth",
        image: "https://lorempixel.com/300/240",
        component: GranularSynth,
        audio: GranularSynthAudio
    },
]


export { SourceType, SourceTypes };