import GranularSynth from './GranularSynth';
import GranularSynthAudio from './GranularSynth/GranularSynthAudio'
import TapeLooper from './TapeLooper';
import TapeLooperAudio from './TapeLooper/TapeLooperAudio';
import MPC from './MPC';
import MPCAudio from './MPC/MPCAudio';


const SourceType = Object.freeze({
    TapeLooper: Symbol("TapeLooper"),
    GranularSynth: Symbol("GranularSynth"),
    MPC: Symbol("MPC")
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
        type: SourceType.GranularSynth,
        text: "Granular Synth",
        image: "https://lorempixel.com/300/240",
        component: GranularSynth,
        audio: GranularSynthAudio
    },
    {
        type: SourceType.MPC,
        text: "MPC Drum Pads",
        image: "https://lorempixel.com/300/240",
        component: MPC,
        audio: MPCAudio
    }
]


export { SourceType, SourceTypes };