import React from 'react';
import {Range} from 'immutable';
import {uraTile, tileImage, tileName} from '../../lib/tile';

export class HandTilesComponent extends React.Component {
    render(){
        const {tiles, player, onSelect, addition} = this.props;
        const c = "mahjong-tiles" + (player!=null ? ` mahjong-tiles-${player}` : "");
        return <div className={c}>
            <span>{
                tiles.map((tile, i)=> <img key={`tile-${i}`} className="mahjong-tile-image" src={tileImage(tile)} onClick={onSelect ? onSelect(i) : null}/>).toArray()
            }</span>
            {addition!=null ?
                <span className="mahjong-tiles-addition">
                    <img className="mahjong-tile-image" src={tileImage(addition)}/>
                </span>
                : null
            }
        </div>;
    }
}

export class DeckComponent extends React.Component {
    render(){
        const {deckNumber, dora} = this.props;
        return <div>
            <div className="mahjong-deck-wanpai">{
                Range(0, 7).map(i => <img key={`wanpai-${i}`} className="mahjong-tile-image-small" src={tileImage(i===2 ? dora : uraTile)}/>)
            }</div>
            <div className="mahjong-deck-top">{
                Range(0, Math.max(0, Math.ceil(deckNumber/2)-17*3)).map(i => <img key={`wanpai-${i}`} className="mahjong-tile-image-small" src={tileImage(uraTile)}/>)
            }</div>
            <div className="mahjong-deck-right">{
                Range(0, Math.max(0, Math.min(17, Math.ceil(deckNumber/2)-17*2))).map(i => <img key={`wanpai-${i}`} className="mahjong-tile-image-small" src={tileImage(uraTile)}/>)
            }</div>
            <div className="mahjong-deck-bottom">{
                Range(0, Math.max(0, Math.min(17, Math.ceil(deckNumber/2)-17))).map(i => <img key={`wanpai-${i}`} className="mahjong-tile-image-small" src={tileImage(uraTile)}/>)
            }</div>
            <div className="mahjong-deck-left">{
                Range(0, Math.max(0, Math.min(17, Math.ceil(deckNumber/2)))).map(i => <img key={`wanpai-${i}`} className="mahjong-tile-image-small" src={tileImage(uraTile)}/>)
            }</div>
        </div>;
    }
}

export class DiscardComponent extends React.Component {
    render(){
        const {discard} = this.props;
        return <div>
            <div className="mahjong-discard-0">{
                discard!=null ? 
                    (<img className="mahjong-tile-image-small" src={tileImage(discard)}/>)
                : null
            }</div>
        </div>;
    }
}
