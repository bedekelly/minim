import React, {Component} from 'react';
import './App.css';

import uuid from "uuid4";

import {Filter, TapeRecorder} from './Components';


class App extends Component {

  constructor(props) {
      super(props);
      this.makeSource = this.makeSource.bind(this);
      this.state = { components: [], source: null }
  }

  async addFilter() {
      const { context, source } = this.state;
      await this.addComponent(
          <Filter
              input={source}
              context={context}
              key={uuid()}/>
      );
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

  async makeContext() {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      if (context.state === 'suspended' && 'ontouchstart' in window) {
          console.log("Trying to resume context...");
          await context.resume();
          console.log("Done!");
      }
      await this.setState({...this.state, context});
  }

  async addTapeRecorder() {
      await this.makeContext();
      await this.addComponent(
          <TapeRecorder
              makeSource={this.makeSource}
              context={this.state.context}
              key={uuid()} />
      );
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
