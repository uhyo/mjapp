//点数をあれする
import objectAssign from 'object-assign';
import {Range} from 'immutable';
import {WIND_NUMBER} from '../lib/wind';

import {ACTION_INIT} from '../actions/init';
import {ACTION_SHOW_POINT} from '../actions/play';

const initialPoint = 25000;

const initialState = Range(0,WIND_NUMBER).map(_ =>initialPoint);

export default function reducer(state = initialState,action){
    switch(action.type){
        case ACTION_INIT:
            return initialState;
        case ACTION_SHOW_POINT:
            return movePoint(state, action);
        default:
            return state;
    }
}

function movePoint(state, {winner, point}){
    return state.map((p, i)=>{
        if(i===0){
            return p-point;
        }else if(i===winner){
            return p+point;
        }else{
            return p;
        }
    });
}
