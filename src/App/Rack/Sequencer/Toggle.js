import React from 'react';

import './Toggle.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLockAlt, faUnlockAlt } from '@fortawesome/pro-solid-svg-icons';

library.add(faLockAlt, faUnlockAlt);


export default function Toggle(props) {
    const iconValue = props.value ? "lock-alt" : "unlock-alt";
    const icon = <FontAwesomeIcon icon={ ["fas", iconValue] }></FontAwesomeIcon>
    const className = `toggle ${props.className || ''} ${props.value ? "on" : "off"}`;
    return <button className={ className } onClick={ props.onChange }>{ icon }</button>
}
