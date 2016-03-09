import React from 'react';

export class ResultComponent extends React.Component{
    render(){
        const {point} = this.props;
        const playerNames = ["あなた","めいちゃん","めいちゃん","めいちゃん"];
        const ps = point.toKeyedSeq().sort((a,b)=> b-a).entrySeq();
        console.log(ps);
        return <div className="mahjong-effect-result">
            <div className="mahjong-result">{
            ps.map(([player, point], i)=>
                   <div key={player} className="mahjong-result-row">
                       <div className="mahjong-result-number">{i+1}位</div>
                       <div className="mahjong-result-name">{playerNames[player]}</div>
                       <div className="mahjong-result-point">{point}</div>
                   </div>)
            }</div>
            <div className="mahjong-end">
                完
            </div>
        </div>;
    }
}
