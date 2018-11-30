import React, { Component } from 'react';
import './App.css';

import uuid from "uuid4";

import { Filter, TapeRecorder } from './Components';


class App extends Component {

  constructor(props) {
      super(props);
      this.state = {
          components: [],
          source: null
      };
  }

  addFilter() {
    this.addComponent(<Filter key={uuid()}/>);
  }

  addComponent(component) {
      return this.setState({
          components: [...this.state.components, component]
      });
  }

  async addTapeRecorder() {
      await this.addComponent(<TapeRecorder key={uuid()} />);
      this.setState({...this.state, source: true})
  }

  render() {
      return <section className="app">

          <div className="components-wrapper">
              <section className={"components"}>
                  { this.state.components }
              </section>
          </div>

          <section className="add-buttons">
              { this.state.source ? null : <button onClick={() => this.addTapeRecorder()}>Add Tape Player</button> }
              { this.state.source ? <button onClick={() => this.addFilter()}>Add Filter</button> : null }
          </section>
      </section>;
  }
}


export default App;
