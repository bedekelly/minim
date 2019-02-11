import React from "react";

import { SourceTypes } from '../Sources/SourceTypes';
import { EffectTypes } from '../Effects/EffectTypes'

import SortableEffectsList from './SortableEffectsList';

import { SourceModal, EffectsModal } from './Modals';
// import Sequencer from '../Sequencer';
import Recorder from '../Recorder';

import { arrayMove } from 'react-sortable-hoc';

import './Rack.css';


class Rack extends React.Component {

    constructor(props) {
        super(props);
        this.state = { source: null, effects: [], sourceModalOpen: false, effectsModalOpen: false };
        this.appAudio = this.props.appAudio;
        this.rackAudio = this.appAudio.racks[this.props.id];
        this.wrapperRef = React.createRef();
    }
    
    openSourceModal() {
        this.setState({ sourceModalOpen: true });
    }
    
    openEffectsModal() {
        this.setState({ effectsModalOpen: true })
    }

    addSource(sourceType) {
        const { id, component } = this.rackAudio.addSource(sourceType);
        this.setState({ sourceModalOpen: false, source: { id, component, type: sourceType }});
    }

    addEffect(effectType) {
        const effect = this.rackAudio.addEffect(effectType);
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
        else return <div className="add-source" onClick={ () => this.openSourceModal() }></div>
    }
    
    onSortEnd({oldIndex, newIndex}) {
        this.rackAudio.moveEffect({oldIndex, newIndex});
        this.setState({
          effects: arrayMove(this.state.effects, oldIndex, newIndex),
      })}

    removeEffect(id) {
        this.rackAudio.removeEffect(id);
        const effectsToKeep = effect => effect.id !== id;
        this.setState({effects: this.state.effects.filter(effectsToKeep)});
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
                <div className="components-wrapper" >
                    { /* <Sequencer audio={ this.rackAudio.sequencer } appAudio={ this.appAudio }/> */ }
                    <Recorder audio={ this.rackAudio.recorder } appAudio={ this.appAudio }></Recorder>
                    <section className={"components"}>
                        { this.sourceComponent() }
                        { <EffectsList 
                            effects={this.state.effects}
                            removeEffect={ id => this.removeEffect(id) }
                            onSortEnd={ result => this.onSortEnd(result) }
                            axis="xy"
                            useDragHandle
                            helperClass={"being-dragged"}
                            /> }
                        <div className="add-effect" onClick={ () => this.openEffectsModal() }></div>
                    </section>
                </div>
            </section>
        </React.Fragment>
    }
}


export default Rack;