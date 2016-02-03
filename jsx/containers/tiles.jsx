import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import TilesComponent from '../components/tiles.jsx';

class Tiles extends React.Component{
    render(){
        const {hand} = this.props;
        return <div>{
            hand.map((tiles,i) => <TilesComponent tiles={tiles} player={i} key={`tile-player-${i}`}/>).toArray()
        }</div>;
    }
}

const select = state => state.tile;

export default connect(select)(Tiles);
