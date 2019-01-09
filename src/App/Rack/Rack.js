import React from "react";

import { SourceTypes } from '../utils/SourceTypes';
import { EffectTypes } from '../utils/EffectTypes'

import { Source } from '../Components/Sources';
import SortableEffectsList from './SortableEffectsList';

import { arrayMove } from 'react-sortable-hoc';

import './Rack.css';


class Rack extends React.Component {

    constructor(props) {
        super(props);
        this.state = { source: null, effects: [] };
        this.graph = this.props.audioGraph;
        this.audioRack = this.graph.racks[this.props.id];
    }

    addSource(sourceType) {
        const source = this.audioRack.addSource(sourceType);
        this.setState({...this.state, source: { id: source, type: sourceType }});
    }
    
    addEffect(effectType) {
        const effect = this.audioRack.addEffect(effectType);
        this.setState({...this.state, effects: [...this.state.effects, {id: effect, effectType}]})
    }

    sourceComponent() {
        return this.state.source && <Source 
            sourceType={this.state.source.type} 
            playing={this.props.playing} 
            id={this.state.source.id} 
            audioGraph={this.graph}>
        </Source>
    }

    onSortEnd({oldIndex, newIndex}) {
        this.audioRack.moveEffect({oldIndex, newIndex});
        this.setState({
          effects: arrayMove(this.state.effects, oldIndex, newIndex),
      })}

    render() {
        
        const EffectsList = SortableEffectsList(this.graph);
        
        return <section className={"rack"}>
            <div className="components-wrapper">
                <section className={"components"}>
                    { this.sourceComponent() }
                    { <EffectsList 
                        effects={this.state.effects} 
                        onSortEnd={result => this.onSortEnd(result)}
                        axis="xy"
                        /> }
                </section>
            </div>

            <section className="add-buttons">
                { this.state.source ? null : SourceTypes.map(({type, text}) =>
                    <button key={text} onClick={() => this.addSource(type)}>{text}</button>
                ) }
                { EffectTypes.map(({type, text}) => 
                    <button key={text} onClick={() => this.addEffect(type)}>{text}</button>
                )}
            </section>
        </section>
    }
}


export default Rack;