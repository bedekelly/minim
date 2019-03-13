import React from 'react';
import './DraggableAudioData.css';
import uuid from 'uuid';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic } from '@fortawesome/free-solid-svg-icons';

library.add(faMusic);


export default function DraggableAudioData(props) {
    const loopStart = props.audio.loopStart;
    const loopEnd = props.audio.loopEnd;
    const buffer = props.audio.buffer;
    const playbackRate = props.audio.playbackRate;
    
    function dragStart(options) {
        const id = uuid();
        if (!window.audioData) window.audioData = {};
        window.audioData[id] = { loopStart, loopEnd, buffer, playbackRate };
        options.dataTransfer.setData("id", id);
    }
    
    return <div className="draggable-audio-data"
        onDragStart={ dragStart }>
        <FontAwesomeIcon icon={["fas", "music"]} size="lg" />
    </div>;
}