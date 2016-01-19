import React from 'react';
import {WING_NAMES} from '../../lib/wing';

export default class PointBoard extends React.Component {
    render(){
        const {point}=this.props;
        //TODO
        return <div className="mahjong-point-board">{
            point.map((point, i)=>{
                return <div key={i}>{WING_NAMES[i]} {point}</div>;
            }).toArray()
        }</div>;
    }
}