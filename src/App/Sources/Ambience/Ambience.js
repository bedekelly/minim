import React from 'react';

import './Ambience.css';


class Ambience extends React.Component {
    render() {
        return <div className="ambience">
          <img src={"https://placeimg.com/300/200/any"} alt=""></img>
          <img className="blurred-image" src={"https://placeimg.com/300/200/any"} alt=""></img>
          <div className="inset-shadow"></div>
          <div className="button left">{ "<" }</div>
          <div className="button right">{ ">" }</div>
        </div>;
    }
}


export default Ambience;