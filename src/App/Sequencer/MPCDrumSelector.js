import React from 'react';

const DRUM_LAYOUT = [
    12, 13, 14, 15, 
    8,  9,  10, 11,
    4,  5,  6,  7 ,
    0,  1,  2,  3
];


export default class MPCDrumSelector extends React.Component {
    
    constructor(props) {
        super(props);
        this.onChange = props.onChange;
    }
    
    render() {
        console.log("rendered with ", this.props.value);
        return <div className="buttons">
            {
                DRUM_LAYOUT.map(
                    (i, _) => {
                        const className = "button" + (this.props.value === i ? " selected" : "");
                        return <div 
                            key={ `drum-${i}` }
                            className={ className } 
                            onMouseDown={ () => this.onChange(i) }
                        >
                            <div className="colour-indicator" style={{
                                background: this.props.colours[i]
                            }}></div>
                        </div>
                    }
                )
            }
        </div>
    }
    
    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.value !== this.props.value;
    }
}

