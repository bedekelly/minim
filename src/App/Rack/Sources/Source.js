import React from 'react';


function Source(props) {
    const Component = props.sourceType.component;
    return <Component {...props}></Component>
}


export default Source;