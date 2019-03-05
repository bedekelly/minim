import React from "react";

import { SourceTypes } from './Sources/SourceTypes';
import { EffectTypes } from './Effects/EffectTypes'

import SortableEffectsList from './SortableEffectsList';
import EditableTextBox from 'Components/EditableTextBox';
import { SourceModal, EffectsModal } from './Modals';
import MuteToggle from './MuteToggle';
import Sequencer from './Sequencer';
import Recorder from './Recorder';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/pro-solid-svg-icons';


import { arrayMove } from 'react-sortable-hoc';

import './Rack.css';

library.add(faTimes);


class Rack extends React.Component {

    constructor(props) {
        super(props);
        this.state = { 
            source: null, 
            effects: [],
            name: "Rack",
            sourceModalOpen: false, 
            effectsModalOpen: false
        };
        this.appAudio = this.props.appAudio;
        this.audio = this.appAudio.racks[this.props.id];
        this.wrapperRef = React.createRef();
    }
    
    openSourceModal() {
        this.setState({ sourceModalOpen: true });
    }
    
    openEffectsModal() {
        this.setState({ effectsModalOpen: true })
    }

    addSource(sourceType) {
        const { id, component } = this.audio.addSource(sourceType);
        this.setState({ sourceModalOpen: false, source: { id, component, type: sourceType }});
    }

    addEffect(effectType) {
        const effect = this.audio.addEffect(effectType);
        this.setState({ effectsModalOpen: false, effects: [...this.state.effects, {id: effect, effectType}]})
    }

    sourceComponent() {
        const Component = this.state.source && this.state.source.component;
        if (Component) return <Component
            sourceType={this.state.source.type} 
            playing={this.props.playing} 
            id={this.state.source.id} 
            appAudio={this.appAudio}>
        </Component>
        else return <div className="add-source" onClick={ () => this.openSourceModal() }>
            <span className="add-source-plus">+</span>
            <span className="add-source-title">Instrument</span>
        </div>
    }
    
    onSortEnd({oldIndex, newIndex}) {
        this.audio.moveEffect({oldIndex, newIndex});
        this.setState({
          effects: arrayMove(this.state.effects, oldIndex, newIndex),
      })}

    removeEffect(id) {
        this.audio.removeEffect(id);
        const effectsToKeep = effect => effect.id !== id;
        this.setState({effects: this.state.effects.filter(effectsToKeep)});
    }
    
    deleteSelf() {
        this.props.deleteSelf();
    }
    
    setMute(mute) {
        if (mute) {
            this.audio.mute();
        } else {
            this.audio.unmute();
        }
        
        this.setState({ mute })
    }
    
    setName(name) {
        this.setState({ name })
    }
    
    recorderComponent() {
        if (this.state.recorderAdded) {
            return <Recorder audio={ this.audio.recorder } appAudio={ this.appAudio }/>
        } else if (this.state.sequencerAdded) {
            return null;
        } else {
            return <button className="add-button add-recorder" onClick={ () => this.addRecorder() }>+ Recorder</button>
        }        
    }
    
    sequencerComponent() {
        if (this.state.sequencerAdded) {
            return <Sequencer audio={ this.audio.sequencer } appAudio={ this.appAudio }/>
        } else if (this.state.recorderAdded) {
            return null;
        } else {
            return <button className="add-button add-sequencer" onClick={ () => this.addSequencer() }>+ Sequencer</button>
        }        
    }
    
    addSequencer() {
        this.audio.addSequencer();
        this.setState({ sequencerAdded: true });
    }
    
    addRecorder() {
        this.audio.addRecorder();
        this.setState({ recorderAdded: true });
    }
    
    render() {
        const EffectsList = SortableEffectsList(this.appAudio);
        return <React.Fragment>
            { this.state.effectsModalOpen && 
                <EffectsModal
                    x={100 + this.wrapperRef.current.getBoundingClientRect().x}
                    close={ () => this.setState({ effectsModalOpen: false })}
                    chooseItem={ this.addEffect.bind(this) }
                    items={ EffectTypes }>
                </EffectsModal> }
            { this.state.sourceModalOpen && 
                <SourceModal 
                    x={100 + this.wrapperRef.current.getBoundingClientRect().x}
                    close={ () => this.setState({ sourceModalOpen: false })}
                    chooseItem={ this.addSource.bind(this) }
                    items={ SourceTypes }>
                </SourceModal> }
            <section className={ "rack" + (this.props.selected ? " selected" : "") } onClick={ this.props.select } ref={ this.wrapperRef }>
                <MuteToggle muted={ this.state.mute } onChange={ value => this.setMute(value) }/>
                <EditableTextBox value={ this.state.name } onChange={ value => this.setName(value) } klass="rack-title"></EditableTextBox>
                <button className="delete-rack" onClick={ () => this.deleteSelf() }>
                    <FontAwesomeIcon icon={ ["fas", "times" ]}></FontAwesomeIcon>
                </button>
                <div className="components-wrapper" >
                    { /*<Recorder audio={ this.audio.recorder } appAudio={ this.appAudio }></Recorder> */ }
                    { /*  */ }
                    <section className={"components"}>
                        { this.sequencerComponent() }
                        { this.recorderComponent() }
                        { this.sourceComponent() }
                        { <EffectsList 
                            effects={this.state.effects}
                            removeEffect={ id => this.removeEffect(id) }
                            onSortEnd={ result => this.onSortEnd(result) }
                            axis="xy"
                            useDragHandle
                            helperClass={"being-dragged"}
                            /> }
                        <div className="add-effect" onClick={ () => this.openEffectsModal() }>
                            <span className="add-effect-plus">+</span>
                            <span className="add-effect-title">Effect</span>
                        </div>
                    </section>
                </div>
            </section>
        </React.Fragment>
    }
}


export default Rack;