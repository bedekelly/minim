import React from 'react';

import Pan from './Pan';
import Filter from './Filter';
import Gain from './Gain';
import Compressor from './Compressor';
import Reverb from './Reverb';
import { EffectType } from './EffectTypes';
import Knob from '../Knob';


import './Effect.css';

// Map effect types onto the component that should be rendered.
const effectComponents = {
    [EffectType.Pan]: Pan,
    [EffectType.Filter]: Filter,
    [EffectType.Gain]: Gain,
    [EffectType.Compressor]: Compressor,
    [EffectType.Reverb]: Reverb
}


/**
 * Display an effect component for a given effect type.
 */
class Effect extends React.Component {

    constructor(props) {
        super(props);
        this.changeWet = this.changeWet.bind(this);
        this.audio = this.props.appAudio.effects[this.props.id];
        this.state = { wet: this.audio.wet };
        this.props = props;
    }
    
    changeWet(value) {
        this.audio.wet = value;
        this.setState({ wet: value });
    }

    render() {
        const props = this.props;
        let defaultComponent = props => "no component found";
        const Component = effectComponents[props.effectType] || defaultComponent;
        return <div className="effect">
            <div className="wetdry">
                <Knob min={0} max={1} value={this.state.wet} onChange={this.changeWet}></Knob>
            </div>
            { props.handle }
            <button className="remove" onClick={props.removeSelf}>X</button>
            <Component key={props.id} {...props}></Component>
        </div>
    }
    

}

 
export default Effect;