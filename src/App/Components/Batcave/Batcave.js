import React from "react";

import './Batcave.css';

import batcave from './Batcave.svg';


class Batcave extends React.Component {
    render() {
        return <div className={"batcave"}>
            <img src={ batcave } alt="" width={81} height={81}/>
        </div>
    }
}


export default Batcave;