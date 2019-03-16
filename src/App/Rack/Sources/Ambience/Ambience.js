import React from 'react';

import Wind from './Images/Wind.jpeg';
import Rainstorm from './Images/Rainstorm.jpeg';
import Record from './Images/Record.jpeg';

import './Ambience.css';


const IMAGES = {
    Rainstorm, Wind, Record
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