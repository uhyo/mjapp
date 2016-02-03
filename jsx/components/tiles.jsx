import React from 'react';
import {tileImage,tileName} from '../../lib/tile';

export default class Tiles extends React.Component {
    render(){
        const {tiles, player} = this.props;
        console.log(tiles);
        //Seq
        return <div className={`mahjong-tiles mahjong-tiles-${player}`}>{
            tiles.map((tile, i) => <img key={i+"-"+tileName(tile)} src={tileImage(tile)}/>).toArray()
        }</div>;
    }
}
