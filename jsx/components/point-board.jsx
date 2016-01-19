import React from 'react';
import {WIND_NAMES} from '../../lib/wind';

export default class PointBoard extends React.Component {
    render(){
        const {point}=this.props;
        //TODO
        return <div className="mahjong-point-board">{
            point.map((point, i)=>{
                return <div key={i}>{WIND_NAMES[i]} {point}</div>;
            }).toArray()
        }</div>;
    }
}