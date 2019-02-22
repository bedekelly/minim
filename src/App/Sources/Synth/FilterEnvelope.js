import React from 'react';

import Slider from '../../Slider';


export default class FilterEnvelope extends React.Component {
    
    constructor(props) {
        super(props);
        this.audio = props.audio;
        this.state = {
            filterAttack: this.audio.filterEnvelope.attack,
            filterDecay: this.audio.filterEnvelope.decay,
            filterSustain: this.audio.filterEnvelope.sustain,
            filterRelease: this.audio.filterEnvelope.release,
        }
    }
    
    setFilterAttack(attack) {
        attack = parseFloat(attack);
        this.audio.filterEnvelope.attack = attack;
        this.setState({ filterAttack: attack });
    }
    
    setFilterDecay(decay) {
        decay = parseFloat(decay);
        this.audio.filterEnvelope.decay = decay;
        this.setState({ filterDecay: decay })
    }
    
    setFilterSustain(sustain) {
        sustain = parseFloat(sustain);
        this.audio.filterEnvelope.sustain = sustain;
        this.setState({ filterSustain: sustain });
    }
    
    setFilterRelease(release) {
        release = parseFloat(release);
        this.audio.filterEnvelope.release = release;
        this.setState({ filterRelease: release });
    }
    
    render() {
        return <div className="comp envelope filter-envelope">
          <h2>Filter Env.</h2>
          <div className="slidecontainer">
              <Slider min={ 0 } max={ 1 } step={ 0.01 }
                  value={ this.state.filterAttack }
                  default={ 0 }
                  units="s"
                  label="Attack"
                  precision={ 2 }
                  onChange={ value => this.setFilterAttack(value) }
                  appAudio={ this.props.appAudio }
                  id={ this.props.id + "-filter-attack" }
                  ></Slider>
          </div>
          <div className="slidecontainer">
              <Slider min={ 0 } max={ 1 } step={ 0.01 } 
                  value={ this.state.filterDecay }
                  default={ 0 }
                  units="s"
                  label="Decay"
                  precision={ 2 }
                  onChange={ value => this.setFilterDecay(value) }
                  appAudio={ this.props.appAudio }
                  id={ this.props.id + "-filter-decay" }
                  ></Slider>
          </div>
          <div className="slidecontainer">
              <Slider min={ 0 } max={ 1 } step={ 0.01 } 
                  value={ this.state.filterSustain }
                  default={ 1 }
                  units="%"
                  label="Sustain"
                  precision={ 0 }
                  scale={ 100 }
                  onChange={ value => this.setFilterSustain(value) }
                  appAudio={ this.props.appAudio }
                  id={ this.props.id + "-filter-sustain" }
                  ></Slider>
          </div>
          <div className="slidecontainer">
              <Slider min={ 0.01 } max={ 1 } step={ 0.01 } 
                  value={ this.state.filterRelease }
                  default={ 0.01 }
                  units="s"
                  label="Release"
                  precision={ 2 }
                  onChange={ value => this.setFilterRelease(value) }
                  appAudio={ this.props.appAudio }
                  id={ this.props.id + "-filter-release" }
                  ></Slider>
          </div>
          <div className="label">A</div>
          <div className="label">D</div>
          <div className="label">S</div>
          <div className="label">R</div>
        </div>
    }
}