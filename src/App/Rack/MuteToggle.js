import React from 'react';

import './MuteToggle.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolume } from '@fortawesome/pro-solid-svg-icons';
import { faVolumeMute } from '@fortawesome/free-solid-svg-icons';

library.add(faVolume, faVolumeMute);


export default function MuteToggle(props) {
    const icon = props.muted ? "volume" : "volume-mute";
    const className = "mute-toggle " + (props.muted ? "muted" : "");
    return <button className={ className }>
        <FontAwesomeIcon icon={ [ "fas", icon ]}></FontAwesomeIcon>
    </button>
}