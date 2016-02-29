//4人分のタイル
import {Seq,Range,Set} from 'immutable';
import objectAssign from 'object-assign';
import {WIND_NUMBER} from '../lib/wind';
import {uraTile, makeDeck} from '../lib/tile';

import {ACTION_DRAW_RANDOM, ACTION_DRAW_DUMMY, ACTION_DRAW_DORA} from '../actions/draw';

import {sortTile} from '../lib/sort';
import {ACTION_SORT} from '../actions/sort';
//
//手札の初期状態（みんな空）
const initialHand = Range(0,WIND_NUMBER).map(_ => Seq());
//山の初期状態（全部ある）
const initialDeck = makeInitialDeck();

const initialState = {
    hand: initialHand,
    deck: initialDeck,
    deckNumber: initialDeck.size - 14,
    dora: uraTile
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
                            Range(0,action.num).map(_ => uraTile)
                        );
                    }else{
                        return tiles;
                    }
                }),
                deckNumber: state.deckNumber - action.num
            });
        case ACTION_DRAW_DORA:
            //ドラを開示
            return takeDora(state);
        case ACTION_SORT:
            //手牌をソート
            return objectAssign({}, state, {
                hand: state.hand.map((tiles)=> sortTile(tiles, action.mode))
            });

        default:
            return state;
    }
}

//山札から何枚かとってあげる
function take(state, player, num){
    const {hand, deck, deckNumber, dora} = state;

    //シャッフルする
    const shf = shuffle(deck.toIndexedSeq());

    //とった分を手札に追加する
    const hand2 = hand.map((tiles, i)=> i===player ? tiles.concat(shf.take(num)) : tiles);
    //山からは除く

    const deck2 = shf.takeLast(shf.size-num).toSet();

    return {
        hand: hand2,
        deck: deck2,
        deckNumber: deckNumber - num,
        dora
    };

}
//Seqをシャッフルする
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

//ドラを開示
function takeDora(state){
    const {deck} = state;
    //山札をシャッフル
    const shf = shuffle(deck.toIndexedSeq());
    console.log("DOOM", shf);
    return objectAssign({}, state, {
        //XXX shf.shift() shf.head()
        deck: shf.slice(1).toSet(),
        dora: shf.get(0)
    });
}

function makeInitialDeck(){
    //初期状態をつくる
    const deckset = makeDeck();
    //Mapにいれる
    return Set(deckset);
}
