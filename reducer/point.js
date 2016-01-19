//点数をあれする
import {Range} from 'immutable';
import {WIND_NUMBER} from '../lib/wind';

const initialPoint = 25000;

const initialState = Range(0,WIND_NUMBER).map(_ =>initialPoint);

export default function reducer(state = initialState,action){
    return state;
}