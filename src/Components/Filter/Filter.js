import React from "react";
import uuid from "uuid4";

import './Filter.css';


function Filter() {
    return <div className="filter" key={uuid()}>
        <input type="range" className="slider" />
    </div>
}


export default Filter;
