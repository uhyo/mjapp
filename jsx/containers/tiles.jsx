import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import store from '../../store';
import {release} from '../../actions/play';
import {STATE_PLAYING} from '../../reducer/state.js';

import {HandTilesComponent, DeckComponent, DiscardComponent} from '../components/tiles.jsx';

class Tiles extends React.Component{
    render(){
        const {state, tile: {hand, deckNumber, dora, discard}} = this.props;
        const onSelect = (index:number)=> this.onSelect(index);
        return <div>
            <div>{
                hand.map((tiles,i) => <HandTilesComponent tiles={tiles} player={i} onSelect={state===STATE_PLAYING && i===0 ? onSelect : null} key={`tile-player-${i}`}/>).toArray()
            }</div>
            <DeckComponent deckNumber={deckNumber} dora={dora} />
            <DiscardComponent discard={discard} />
        </div>;
    }
    onSelect(index:number){
        return (e)=>{
            //牌を捨てる
            store.dispatch(release(0, index));
        };
    }
}

const select = state => state;

export default connect(select)(Tiles);
