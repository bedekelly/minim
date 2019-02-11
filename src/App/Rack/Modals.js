import React from 'react';

import './Modals.css';


function Modal(props) {
    const { x } = props;
    const outerClass = `${props.type} picker`;
    return <div className="background" onClick={props.close}>
              <div className={ outerClass } style={{ left: x }}onClick={e => e.stopPropagation() }>
                  <div className="items">
                  { props.items.map(item =>
                    <div className="item" key={ item.type.toString() } onClick={ () => props.chooseItem(item.type) }>
                      <h2 className="item-title">{ item.text }</h2>
                    </div>)}
                  </div>
              </div>
            </div>
}

const SourceModal = props => Modal({ ...props, type: "source"});
const EffectsModal = props => Modal({ ...props, type: "effects" });

export { SourceModal, EffectsModal };