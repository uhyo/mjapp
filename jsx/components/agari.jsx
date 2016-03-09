import React from 'react';
//import {uraTile, tileImage, tileName} from '../../lib/tile';

import {HandTilesComponent} from '../components/tiles.jsx';

//結果表示
export class AgariComponent extends React.Component{
    render(){
        const {player, tiles, yakuman, agarihai} = this.props.agari;
        return <div className="mahjong-effect-agari">
            <div className="mahjong-agari-show">
                <HandTilesComponent tiles={tiles} addition={agarihai}/>
            </div>
            <div>{
                yakuman.map(([name, count])=>
                    <div key={name} className="mahjong-agari-yaku">
                        <div className="mahjong-yaku-name">{name}</div>
                        <div className="mahjong-yaku-score">役満</div>
                    </div>)
            }</div>
        </div>;
    }
}
