import React from 'react';


export default class TapeComponents extends React.Component {
    componentShouldUpdate(newProps, newState) {
        
    }
    
    render() {
        return <React.Fragment>
            <div className="small-reel">
                <div className="middle circle"></div>
                <div className="circle one"></div>
                <div className="circle two"></div>
                <div className="circle three"></div>
                <div className="circle four"></div>
                <div className="circle five"></div>
                <div className="circle six"></div>
                <div className="circle seven"></div>
                <div className="circle eight"></div>
                <div className="circle nine"></div>
            </div>
            <div className="small-reel-shadow"></div>
            <div className="big-reel">
                <div className="hole one"></div>
                <div className="hole two"></div>
                <div className="hole three"></div>
                <div className="middle-hole"></div>
            </div>
            <div className="big-reel-shadow"></div>

            <div className="tape-top"></div>
            <div className="tape-bottom"></div>
        </React.Fragment>
    }
}