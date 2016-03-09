//4人分のタイル
import {Seq,Range,Set, OrderedSet} from 'immutable';
import objectAssign from 'object-assign';
import {WIND_NUMBER} from '../lib/wind';
import {uraTile, makeDeck} from '../lib/tile';
import {randomYakuMaker} from '../lib/yaku';

import {ACTION_DRAW_RANDOM, ACTION_DRAW_DUMMY, ACTION_DRAW_DORA} from '../actions/draw';
import {ACTION_RELEASE, ACTION_HAND_OPEN} from '../actions/play';

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
    dora: uraTile,
    discard: null,
    agari: null
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
        case ACTION_RELEASE:
            //リリース
            return release(state, action.player, action.index);
        case ACTION_HAND_OPEN:
            return handOpen(state, action.player);
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

    const deck2 = shf.takeLast(shf.size-num).toOrderedSet();
    console.log(deck.size, shf.size, shf.takeLast(shf.size-num).size, deck2.size);

    return objectAssign({}, state, {
        hand: hand2,
        deck: deck2,
        deckNumber: deckNumber - num,
    });

}
//Seqをシャッフルする
function shuffle(seq){
    let size = seq.size;
    const from = seq.toArray();
    const arr = [];
    while(size>0){
        const i = Math.floor(Math.random()*size);
        arr.push(from[i]);
        from[i] = from[size-1];
        size--;
    }
    return Seq(arr);
}

//ドラを開示
function takeDora(state){
    const {deck} = state;
    //山札をシャッフル
    const shf = shuffle(deck.toIndexedSeq());
    return objectAssign({}, state, {
        //XXX shf.shift() shf.head()
        deck: shf.slice(1).toOrderedSet(),
        dora: shf.get(0)
    });
}

//手牌から捨てる
function release(state, player, index){
    const {hand} = state;
    const released = hand.get(player).get(index);

    const hand2 = hand.map((tiles,i)=>
                           i===player ?
                               tiles.slice(0, index).concat(tiles.slice(index+1)) :
                               tiles);
    return objectAssign({}, state, {
        hand: hand2,
        discard: released
    });

}

//役を作る
function handOpen(state, player){
    const {hand, deck, discard} = state;
    while(true){
        const yakuMaker = randomYakuMaker();
        const obj  = yakuMaker(discard, hand.get(player), deck);
        if(obj!=null){
            const {tiles:newTiles, deck, yakuman} = obj;
            const sorted = sortTile(Seq(newTiles));
            return objectAssign({}, state, {
                hand: hand.map((tiles, i)=>
                                i===player ? sorted : tiles),
                deck,
                agari: {
                    player,
                    tiles:sorted,
                    agarihai: discard,
                    yakuman
                }
            });
        }
    }
}

function makeInitialDeck(){
    //初期状態をつくる
    const deckset = makeDeck();
    //Mapにいれる
    return OrderedSet(deckset);
}
