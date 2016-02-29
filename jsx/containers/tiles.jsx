import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import {HandTilesComponent, DeckComponent} from '../components/tiles.jsx';

class Tiles extends React.Component{
    render(){
        const {hand, deckNumber, dora} = this.props;
        return <div>
            <div>{
                hand.map((tiles,i) => <HandTilesComponent tiles={tiles} player={i} key={`tile-player-${i}`}/>).toArray()
            }</div>
            <DeckComponent deckNumber={deckNumber} dora={dora} />
        </div>;
    }
}

const select = state => state.tile;

export default connect(select)(Tiles);
