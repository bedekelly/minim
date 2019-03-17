import React from 'react';

import Wind from './Images/Wind.webp';
import Rainstorm from './Images/Rainstorm.webp';
import Record from './Images/Record.webp';
import Fire from './Images/Fire.webp';
import Birds from './Images/Birds.webp';
import Waves from './Images/Waves.webp';
import Train from './Images/Train.webp';
import Cafe from './Images/Cafe.webp';



import './Ambience.css';


const IMAGES = {
    Rainstorm, Wind, Record, Fire, Birds, Waves, Train, Cafe

};

const IMAGE_URL = sound => {
    return IMAGES[sound.name]
};


class Ambience extends React.Component {
    
    constructor(props) {
        super(props);
        this.audio = this.props.appAudio.sources[this.props.id];
        this.state = { sound: this.audio.sound };
    }
    
    componentDidMount() {
        this.audio.play();
    }
    
    previous() {
        if (!this.audio.loaded) return;
        this.setState({sound: this.audio.previous()});
    }
    
    next() {
        if (!this.audio.loaded) return;
        this.setState({sound: this.audio.next()});
    }
    
    render() {
        const imageUrl = IMAGE_URL(this.state.sound);
        return <div className="ambience">
          <img src={imageUrl} alt={`${this.state.sound}`}/>
          <img className="blurred-image" src={imageUrl} alt={`${this.state.sound}`}/>
          <div className="inset-shadow"/>
          <div onClick={ () => this.previous() } className="button left">{ "<" }</div>
          <div onClick={ () => this.next() } className="button right">{ ">" }</div>
        </div>;
    }
}


export default Ambience;