import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import * as serviceWorker from './serviceWorker';


ReactDOM.render(<App />, document.getElementById('root'));


window.onbeforeunload = function(){
    return "Your music won't be saved if you leave!";
};

serviceWorker.register();