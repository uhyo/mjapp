import React from 'react';
import {tileImage,tileName} from '../../lib/tile';

export default class Tiles extends React.Component {
    render(){
        const {tiles} = this.props;
        //Seq
        return <div className="mahjong-tiles">{
            tiles.map((tile, i) => <img key={i+"-"+tileName(tile)} src={tileImage(tile)}/>).toArray()
        }</div>;
    }
}
