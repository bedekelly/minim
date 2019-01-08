import React from "react";

import './Gain.css';


class Gain extends React.Component {

    constructor(props) {
        super(props);
        props.node.gain.setValueAtTime(1.5, props.context.currentTime);
    }

    render() {
        return <div className={"gain"} />
    }
}


export default Gain;