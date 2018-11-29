import React, { Component } from 'react';
import './App.css';

import TapeRecorder from './TapeRecorder';
import Draggable from './utils/Draggable';


class App extends Component {
  render() {
      return <Draggable>
          <TapeRecorder />
      </Draggable>
  }
}


export default App;
