import React from 'react';

import './Ambience.css';


class Ambience extends React.Component {
    
    constructor(props) {
        super(props);
        this.audio = this.props.appAudio.sources[this.props.id];
    }
    
    componentDidMount() {
        this.audio.play();
    }
    
    previous() {
        this.audio.previous();
    }
    
    next() {
        this.audio.next();
    }
    
    render() {
        return <div className="ambience">
          <img src={"https://placeimg.com/300/200/any"} alt=""></img>
          <img className="blurred-image" src={"https://placeimg.com/300/200/any"} alt=""></img>
          <div className="inset-shadow"></div>
          <div onClick={ () => this.previous() } className="button left">{ "<" }</div>
          <div onClick={ () => this.next() } className="button right">{ ">" }</div>
        </div>;
    }
}


export default Ambience;