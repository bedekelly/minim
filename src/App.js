import React, {Component} from 'react';
import './App.css';

import uuid from "uuid4";

import {Filter, TapeRecorder} from './Components';


function createAudioContext() {
    return new (window.AudioContext || window.webkitAudioContext)();
}


class App extends Component {

  constructor(props) {
      super(props);
      this.state = {
          components: [],
          source: null,
          context: createAudioContext()
      };
      this.makeSource = this.makeSource.bind(this);
  }

  addFilter() {
      const audioCtx = this.state.context;
      const source = this.state.source;
      this.addComponent(<Filter input={source} context={audioCtx} key={uuid()}/>);
  }

  async makeSource() {
      const source = this.state.context.createBufferSource();
      await this.setState({...this.state, source});
      return source;
  }

  addComponent(component) {
      return this.setState({
          components: [...this.state.components, component]
      });
  }

  async addTapeRecorder() {
      const recorder = <TapeRecorder makeSource={this.makeSource} context={this.state.context} key={uuid()} />;
      await this.addComponent(recorder);
  }

  render() {
      return <section className="app">

          <div className="components-wrapper">
              <section className={"components"}>
                  { this.state.components }
              </section>
          </div>

          <section className="add-buttons">
              { this.state.source !== null ? null : <button onClick={() => this.addTapeRecorder()}>Add Tape Player</button> }
              { this.state.source !== null ? <button onClick={() => this.addFilter()}>Add Filter</button> : null }
          </section>
      </section>;
  }
}


export default App;
