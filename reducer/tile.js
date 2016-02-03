//4人分のタイル
import {Seq,Range,Set} from 'immutable';
import objectAssign from 'object-assign';
import {WIND_NUMBER} from '../lib/wind';
import {makeDeck, makeDummy} from '../lib/tile';

import {ACTION_DRAW_RANDOM, ACTION_DRAW_DUMMY} from '../actions/draw';
//
//手札の初期状態（みんな空）
const initialHand = Range(0,WIND_NUMBER).map(_ => Seq());
//山の初期状態（全部ある）
const initialDeck = makeInitialDeck();

const initialState = {
    hand: initialHand,
    deck: initialDeck
};

export default function reducer(state = initialState, action){
    switch(action.type){
        case ACTION_DRAW_RANDOM:
            //誰かがランダムにドローする
            return take(state, action.player, action.num);
        case ACTION_DRAW_DUMMY:
            //ダミーをドローする
            return objectAssign({}, state, {
                hand: state.hand.map((tiles, i)=>{
                    if(i===action.player){
                        return tiles.concat(
                            Range(0,action.num).map(_ => makeDummy())
                        );
                    }else{
                        return tiles;
                    }
                })
            });
        default:
            return state;
    }
}

//山札から何枚かとってあげる
function take(state, player, num){
    const {hand, deck} = state;

    //シャッフルする
    const shf = shuffle(deck.toIndexedSeq());

    //とった分を手札に追加する
    const hand2 = hand.map((tiles, i)=> i===player ? tiles.concat(shf.take(num)) : tiles);
    //山からは除く

    const deck2 = shf.takeLast(shf.size-num).toSet();

    return {
        hand: hand2,
        deck: deck2
    };

    function shuffle(seq){
        let size = seq.size;
        const arr = [];
        while(size>0){
            const i = Math.floor(Math.random()*size);
            arr.push(seq.get(i));
            size--;
        }
        return Seq(arr);
    }
}

function makeInitialDeck(){
    //初期状態をつくる
    const deckset = makeDeck();
    //Mapにいれる
    return Set(deckset);
}
