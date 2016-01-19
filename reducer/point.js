//点数をあれする
import {Range} from 'immutable';
import {WING_NUMBER} from '../lib/wing';

const initialPoint = 25000;

const initialState = Range(0,WING_NUMBER).map(_ =>initialPoint);

export default function reducer(state = initialState,action){
    return state;
}