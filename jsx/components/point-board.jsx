import React from 'react';
import {WIND_NAMES} from '../../lib/wind';

export default class PointBoard extends React.Component {
    render(){
        const {point}=this.props;
        //TODO
        return <div className="mahjong-point-board">{
            point.map((point, i)=>{
                return <div key={i}>
                    <span className={`mahjong-point-board-wind mahjong-point-board-wind-${i}`}>{WIND_NAMES[i]}</span>
                    <span className={`mahjong-point-board-score mahjong-point-board-score-${i}`}>{point}</span>
                </div>;
            }).toArray()
        }</div>;
    }
}
