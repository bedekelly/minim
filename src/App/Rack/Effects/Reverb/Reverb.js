import React from "react";

import './Reverb.css';


class Reverb extends React.Component {
    
    constructor(props) {
        super(props);
        this.audio = props.appAudio.effects[props.id];
        this.state = {
            image: this.audio.image
        }
    }
    
    changeIndex(diff) {
        this.audio.changeIndex(diff);
        this.setState({ image: this.audio.image });
    }
    
    render() {
        return <div className="reverb">
          <div className="reverb-inner">
            <img src={this.state.image} alt='' width="80" height="80"/>
            <button className="left" onClick={() => this.changeIndex(-1)}/>
            <button className="right" onClick={() => this.changeIndex(+1)}/>
          </div>
        </div>
    }
}


export default Reverb;