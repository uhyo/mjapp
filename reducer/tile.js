//4人分のタイル
import {Seq,Range} from 'immutable';
import {WING_NUMBER} from '../lib/wing';

//初期状態（みんな空）
const initialState = Range(0,WING_NUMBER).map(_ => Seq());

export default function reducer(state = initialState, action){
    return state;
}