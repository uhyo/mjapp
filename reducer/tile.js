//4人分のタイル
import {Seq,Range} from 'immutable';
import {WIND_NUMBER} from '../lib/wind';

//初期状態（みんな空）
const initialState = Range(0,WIND_NUMBER).map(_ => Seq());

export default function reducer(state = initialState, action){
    return state;
}