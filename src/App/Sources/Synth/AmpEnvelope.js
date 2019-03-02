import React from 'react';
import Slider from 'Components/Slider';

export default class AmpEnvelope extends React.Component {
    
    constructor(props) {
        super(props);
        this.audio = props.audio;
        this.state = {
            ampAttack: this.audio.ampEnvelope.attack,
            ampDecay: this.audio.ampEnvelope.decay,
            ampSustain: this.audio.ampEnvelope.sustain,
            ampRelease: this.audio.ampEnvelope.release
        }
    }
    
    setAmpAttack(ampAttack) {
        ampAttack = parseFloat(ampAttack);
        this.audio.ampAttack = ampAttack;
        this.setState({ ampAttack });
    }
    
    setAmpDecay(ampDecay) {
        ampDecay = parseFloat(ampDecay);
        this.audio.ampDecay = ampDecay;
        this.setState({ ampDecay });
    }
    
    setAmpSustain(ampSustain) {
        ampSustain = parseFloat(ampSustain);
        this.audio.ampSustain = ampSustain;
        this.setState({ ampSustain });
    }
    
    setAmpRelease(ampRelease) {
        ampRelease = parseFloat(ampRelease);
        this.audio.ampRelease = ampRelease;
        this.setState({ ampRelease });
    }
    
    render() {
        return <div className="comp amp envelope">
          <h2>Amp Env.</h2>
          <div className="slidecontainer">
              <Slider min={ 0 } max={ 1 } step={ 0.001 } 
                  value={ this.state.ampAttack }
                  default={ 0 }
                  label="Attack"
                  precision={ 2 }
                  units="s"
                  onChange={ value => this.setAmpAttack(value) }
                  appAudio={ this.props.appAudio }
                  id={ this.props.id + "-amp-attack" }
                  ></Slider>
          </div>
          <div className="slidecontainer">
              <Slider min={ 0 } max={ 1 } step={ 0.001 } 
                  value={ this.state.ampDecay }
                  default={ 0 }
                  label="Decay"
                  precision={ 2 }
                  units="s"
                  onChange={ value => this.setAmpDecay(value) }
                  appAudio={ this.props.appAudio }
                  id={ this.props.id + "-amp-decay" }
                  ></Slider>
          </div>
          <div className="slidecontainer">
              <Slider min={ 0 } max={ 1 } step={ 0.001 } 
                  value={ this.state.ampSustain }
                  default={ 1 }
                  label="Sustain"
                  precision={ 0 }
                  units="%"
                  scale={ 100 }
                  onChange={ value => this.setAmpSustain(value) }
                  appAudio={ this.props.appAudio }
                  id={ this.props.id + "-amp-sustain" }
                  ></Slider>
          </div>
          <div className="slidecontainer">
              <Slider min={ 0.01 } max={ 1 } step={ 0.01 } 
                  value={ this.state.ampRelease }
                  default={ 0.01 }
                  precision={ 2 }
                  units="s"
                  label="Release"
                  onChange={ value => this.setAmpRelease(value) }
                  appAudio={ this.props.appAudio }
                  id={ this.props.id + "-amp-release" }
                  ></Slider>
          </div>
          <div className="label">A</div>
          <div className="label">D</div>
          <div className="label">S</div>
          <div className="label">R</div>
        </div>
    }
}