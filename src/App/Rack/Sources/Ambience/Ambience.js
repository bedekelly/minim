import React from 'react';

import './Ambience.css';


const IMAGE_URL = sound => `https://s3.eu-west-2.amazonaws.com/static-electricity/daw/ambience-images/${sound.name.replace(" ", "+")}.jpeg`;


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
          <img src={ imageUrl } alt={ `${this.state.sound}`}></img>
          <img className="blurred-image" src={ imageUrl } alt={ `${this.state.sound}` }></img>
          <div className="inset-shadow"></div>
          <div onClick={ () => this.previous() } className="button left">{ "<" }</div>
          <div onClick={ () => this.next() } className="button right">{ ">" }</div>
        </div>;
    }
}


export default Ambience;