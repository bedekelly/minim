import React from "react";

import { SourceTypes } from '../Sources/SourceTypes';
import { EffectTypes } from '../Effects/EffectTypes'

import { Source } from '../Sources';
import SortableEffectsList from './SortableEffectsList';

import { SourceModal, EffectsModal } from './Modals';

import { arrayMove } from 'react-sortable-hoc';

import './Rack.css';


class Rack extends React.Component {

    constructor(props) {
        super(props);
        this.state = { source: null, effects: [], sourceModalOpen: false, effectsModalOpen: false };
        this.appAudio = this.props.appAudio;
        this.audioRack = this.appAudio.racks[this.props.id];
    }
    
    openSourceModal() {
        this.setState({ sourceModalOpen: true });
    }
    
    openEffectsModal() {
        this.setState({ effectsModalOpen: true })
    }

    addSource(sourceType) {
        const source = this.audioRack.addSource(sourceType);
        this.setState({ sourceModalOpen: false, source: { id: source, type: sourceType }});
    }
    
    addEffect(effectType) {
        const effect = this.audioRack.addEffect(effectType);
        this.setState({ effectsModalOpen: false, effects: [...this.state.effects, {id: effect, effectType}]})
    }

    sourceComponent() {
        if (this.state.source) return <Source 
            sourceType={this.state.source.type} 
            playing={this.props.playing} 
            id={this.state.source.id} 
            appAudio={this.appAudio}>
        </Source>
        else return <div className="add-source" onClick={ () => this.openSourceModal() }></div>
    }
    
    onSortEnd({oldIndex, newIndex}) {
        this.audioRack.moveEffect({oldIndex, newIndex});
        this.setState({
          effects: arrayMove(this.state.effects, oldIndex, newIndex),
      })}

    removeEffect(id) {
        this.audioRack.removeEffect(id);
        const effectsToKeep = effect => effect.id !== id;
        this.setState({effects: this.state.effects.filter(effectsToKeep)});
    }

    render() {
        const EffectsList = SortableEffectsList(this.appAudio);
        return <React.Fragment>
            { this.state.effectsModalOpen && 
                <EffectsModal 
                    close={ () => this.setState({ effectsModalOpen: false })}
                    chooseItem={ this.addEffect.bind(this) }
                    items={ EffectTypes }>
                </EffectsModal> }
            { this.state.sourceModalOpen && 
                <SourceModal 
                    close={ () => this.setState({ sourceModalOpen: false })}
                    chooseItem={ this.addSource.bind(this) }
                    items={ SourceTypes }>
                </SourceModal> }
            <section className={"rack"}>
                <div className="components-wrapper">
                    <section className={"components"}>
                        { this.sourceComponent() }
                        { <EffectsList 
                            effects={this.state.effects}
                            removeEffect={ id => this.removeEffect(id) }
                            onSortEnd={ result => this.onSortEnd(result) }
                            axis="xy"
                            useDragHandle
                            /> }
                        <div className="add-effect" onClick={ () => this.openEffectsModal() }></div>
                    </section>
                </div>
            </section>
        </React.Fragment>
    }
}


export default Rack;