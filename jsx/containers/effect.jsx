import React from 'react';
import { connect } from 'react-redux';

import {STATE_RON, STATE_SHOW_YAKU, STATE_SHOW_POINT} from '../../reducer/state';

import {AgariComponent} from '../components/agari.jsx';
import {ResultComponent} from '../components/result.jsx';

class Effect extends React.Component{
    render(){
        const {state, tile, point}=this.props;
        if(state===STATE_RON){
            return <div>
                <img className="mahjong-effect-ron" src={require('url!../../images/ron.gif')} width="600" height="600"/>
            </div>;
        }else if(state===STATE_SHOW_YAKU){
            //役の表示
            const {agari} = tile;
            return <AgariComponent agari={agari}/>
        }else if(state===STATE_SHOW_POINT){
            return <ResultComponent point={point}/>;
        }else{
            return <div/>;
        }
    }
}

const select = store => store;

export default connect(select)(Effect);


