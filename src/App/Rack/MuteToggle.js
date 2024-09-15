import React from 'react';

import './MuteToggle.css';

import { MutedIcon, UnmutedIcon } from '../../Icons';


export default function MuteToggle(props) {
    const icon = props.muted ? <MutedIcon /> : <UnmutedIcon />
    const className = "mute-toggle " + (props.muted ? "muted" : "");
    return <button className={ className } onClick={ () => props.onChange(!props.muted) }>
        {icon}
    </button>
}