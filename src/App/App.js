import React, {Component} from 'react';
import "stereo-panner-shim";
import viewportFix from "viewport-units-buggyfill";

import { arrayMove } from 'react-sortable-hoc';

import Rack from "./Rack";
import AppAudio from './AppAudio';
import SortableEffectsList from './Rack/SortableEffectsList';
import { EffectsModal } from './Rack/Modals';
import { EffectTypes } from './Effects/EffectTypes'

import './App.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faStop } from '@fortawesome/pro-solid-svg-icons';

library.add(faPlay, faPause, faStop);


viewportFix.init();


/**
 * Main "App" component responsible for rendering and controlling the whole webapp.
 */
class App extends Component {

    constructor(props) {
        super(props);
        this.appAudio = new AppAudio();
        this.state = { loaded: false, racks: [], playing: false, selectedRack: this.appAudio.selectedRack,
        globalEffects: [], learning: false }
    }
    
    async initialise() {
        if (this.state.loaded) return;
        await this.appAudio.initialise();
        await this.setState({loaded: true});
    }

    async addRack() {
        await this.initialise();
        const rack = await this.appAudio.makeRack();
        this.selectRack(rack.id);
        return this.setState({ racks: [ ...this.state.racks, rack ] })
    }

    playAll() {
        this.appAudio.playAll();
        this.setState({playing: this.appAudio.playing});
    }

    pauseAll() {
        this.appAudio.pauseAll();
        this.setState({playing: this.appAudio.playing});
    }
    
    stopAll() {
        this.appAudio.stopAll();
        this.setState({ playing: this.appAudio.playing });
    }
    
    selectRack(id) {
        this.setState({ selectedRack: id });
        this.appAudio.selectRack(id);
    }
    
    get selectedRack() {
        return this.state.selectedRack;
    }
    
    deleteRack(id) {
        this.appAudio.deleteRack(id);
        this.setState({
            racks: this.state.racks.filter(r => r.id !== id)
        })
    }
    
    componentDidMount() {
        this.appAudio.setLearning = learning => this.setState({ learning });
    }
    
    globalEffectsComponent() {
        const EffectsList = SortableEffectsList(this.appAudio);
        if (!this.state.globalEffectsRackOpen) return null;
        return <section className="global-effects-rack">
            <div className="effects-rack">
                { <EffectsList 
                    effects={this.state.globalEffects}
                    removeEffect={ id => this.removeEffect(id) }
                    onSortEnd={ result => this.onSortEnd(result) }
                    axis="xy"
                    useDragHandle
                    helperClass={"being-dragged"}
                    /> }
            </div>
            <EffectsModal
                close={ () => this.closeGlobalEffectsRack() }
                chooseItem={ effect => this.addGlobalEffect(effect) }
                items={ EffectTypes }>
            </EffectsModal>
        </section>
    }
    
    onSortEnd({oldIndex, newIndex}) {
        this.appAudio.moveGlobalEffect({oldIndex, newIndex});
        this.setState({
          globalEffects: arrayMove(this.state.globalEffects, oldIndex, newIndex),
      })}

    removeEffect(id) {
        this.appAudio.removeGlobalEffect(id);
        const effectsToKeep = effect => effect.id !== id;
        this.setState({globalEffects: this.state.globalEffects.filter(effectsToKeep)});
    }

    addGlobalEffect(effectType) {
        const effectId = this.appAudio.addGlobalEffect(effectType);
        this.setState({ globalEffects: [...this.state.globalEffects, {id: effectId, effectType}]});
    }

    async openGlobalEffectsRack() {
        await this.initialise();
        return this.setState({ globalEffectsRackOpen: true });
    }
    
    closeGlobalEffectsRack() {
        this.setState({ globalEffectsRackOpen: false });
    }
    
    render() {
        const noRacks = this.state.racks.length === 0;
        const addRackClass = `add-rack ${noRacks ? "center" : ""}`;
        const midiLearningClass = `midi-learn ${this.state.learning ? "learning" : ""}`;
        return <section className="app">
            { this.globalEffectsComponent() }
            { this.state.racks.map(rack => 
                <Rack 
                    key={rack.id} id={rack.id} appAudio={this.appAudio} 
                    selected={ this.state.selectedRack === rack.id }
                    playing={this.state.playing} select={() => this.selectRack(rack.id)}
                    deleteSelf={ () => this.deleteRack(rack.id) }>
                </Rack>
            ) }
            <button className={ addRackClass } onClick={() => this.addRack()}><p className="plus">+</p><p>Rack</p></button>
            
            <button className="open-global-effects-rack" onClick={ () => this.openGlobalEffectsRack() }>Master FX</button>
            
            <div className={ midiLearningClass }>MIDI Learning</div>
    
            <div className="play-controls">
                <button className="stop-all" onMouseDown={ () => this.stopAll()}>
                    <FontAwesomeIcon icon={ ["fas", "stop"] } size="lg"></FontAwesomeIcon>
                </button>
                <button className="pause-all" onMouseDown={() => this.pauseAll()}>
                    <FontAwesomeIcon icon={ ["fas", "pause"] } size="lg"></FontAwesomeIcon>
                </button>
                <button className="play-all" onMouseDown={() => this.playAll()}>
                    <FontAwesomeIcon icon={ ["fas", "play"] } size="lg"></FontAwesomeIcon>
                </button>
                <button className="record" onMouseDown={ () => console.log("record button pressed")}>
                    <FontAwesomeIcon icon={ ["fas", "circle"] } size="lg"></FontAwesomeIcon>
                </button>
            </div>
            
        </section>;
    }
}


export default App;
