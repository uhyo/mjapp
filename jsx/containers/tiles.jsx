import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import TilesComponent from '../components/tiles.jsx';

class Tiles extends React.Component{
    render(){
        const {tile} = this.props;
        return <div>{
            tile.map((tiles,i) => <TilesComponent tiles={tiles} key={`tile-player-${i}`}/>).toArray()
        }</div>;
    }
}

const select = state => state;

export default connect(select)(Tiles);
