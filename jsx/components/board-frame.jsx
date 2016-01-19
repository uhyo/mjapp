import React from 'react';

export default class BoardFrame extends React.Component {
    render(){
        return <div className="mahjong-board-frame">{
            this.props.children
        }</div>;
    }
}