import React from 'react';

import './Toggle.css';
import { LockedIcon, UnlockedIcon } from '../../../Icons';


export default function Toggle(props) {
    const icon = props.value ? <LockedIcon /> : <UnlockedIcon />
    const className = `toggle ${props.className || ''} ${props.value ? "on" : "off"}`;
    return <button className={ className } onClick={ props.onChange }>{ icon }</button>
}
