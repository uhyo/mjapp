import {Seq, Set, OrderedSet} from 'immutable';
import {SUIT_CHARACTER, SUIT_CIRCLE, SUIT_BAMBOO,
        SUIT_WIND, SUIT_DRAGON, SUIT_UNKNOWN,
        RANK_WIND_E, RANK_WIND_S, RANK_WIND_W, RANK_WIND_N,
        RANK_DRAGON_W, RANK_DRAGON_G, RANK_DRAGON_R,
        tileName} from './tile';

import {sortTile} from './sort';

//役メーカー(tiles:Seq, deck:Set, yakuman:number)
export function randomYakuMaker(){
    return 大三元;

    //三元牌をロン
    function 大三元(discard, tiles, deck){
        //役の成立条件
        const {suit:d_suit, rank:d_rank} = discard;
        if(d_suit!==SUIT_DRAGON){
            return null;
        }
        //残っている牌カウント
        const count = {
            [RANK_DRAGON_W]:0,
            [RANK_DRAGON_G]:0,
            [RANK_DRAGON_R]:0
        };
        count[d_rank]++;
        deck.filter(({suit})=> suit===SUIT_DRAGON).forEach(({rank})=>{
            count[rank]++;
        });
        if(count[RANK_DRAGON_W]<3 || count[RANK_DRAGON_G]<3 || count[RANK_DRAGON_R]<3){
            //足りないので無理
            return null;
        }
        count[RANK_DRAGON_W]=count[RANK_DRAGON_G]=count[RANK_DRAGON_R]=3;
        count[d_rank]--;
        //必要なものを敵の手役に突っ込む
        const result=[];
        const deck2 = OrderedSet(deck.toArray().filter((tile)=>{
            const {suit, rank} = tile;
            if(suit===SUIT_DRAGON){
                if(count[rank]>0){
                    count[rank]--;
                    result.push(tile);
                    return false;
                }
            }
            return true;
        }));
        //残り5枚＝雀頭1つ、面子1つ
        const {head, deck:deck3} = takeArbitraryHead(deck2);
        result.push(...head);
        const {ments, deck:deck4} = takeArbitraryMents(deck3);
        result.push(...ments);

        //役をカウント
        let yakuman = [["大三元",1]];
        if(isJihai(head[0]) && isJihai(ments[0])){
            yakuman.push(["字一色",1]);
        }

        return {
            tiles: sortTile(Seq(result)),
            deck: deck4,
            yakuman
        };
    }



    //
    //util function
    function takeArbitraryHead(deck){
        const count={};
        deck.forEach(tile=>{
            const name = tileName(tile);
            count[name] = (count[name]||0)+1;
        });
        let num = 2;
        const result=[];
        for(let name in count){
            if(count[name]>=2){
                //これを採用する
                const deck2 = OrderedSet(deck.toArray().filter(tile=>{
                    if(num>0 && tileName(tile)===name){
                        result.push(tile);
                        num--;
                        return false;
                    }
                    return true;
                }));
                return {
                    head: result,
                    deck: deck2
                };
            }
        }
        throw new Error("雀頭が決まりませんでした");
    }
    //面子（刻子or順子）をとる
    function takeArbitraryMents(deck){
        //スートごとにカウント
        const count = {
            [SUIT_CHARACTER]: {},
            [SUIT_CIRCLE]: {},
            [SUIT_BAMBOO]: {},
            [SUIT_WIND]: {},
            [SUIT_DRAGON]: {},
        };
        let kotu = null, shuntu = null;
        deck.forEach(tile=>{
            const {suit, rank} = tile;
            if(count[suit] != null){
                count[suit][rank] = (count[suit][rank]||0)+1;
                if(count[suit][rank]===3){
                    //刻子がそろった
                    kotu = {
                        suit,
                        rank
                    };
                    return false;
                }
                if(suit===SUIT_CHARACTER || suit===SUIT_CIRCLE || suit===SUIT_BAMBOO){
                    //順子候補
                    if(rank>=3 && count[suit][rank-2]>0 && count[suit][rank-1]>0){
                        shuntu = {
                            suit,
                            rank: rank-2
                        };
                        return false;
                    }
                    if(rank>=2 && rank<=8 &&  count[suit][rank-1]>0 && count[suit][rank+1]>0){
                        shuntu = {
                            suit,
                            rank: rank-1
                        };
                        return false;
                    }
                    if(rank<=7 && count[suit][rank+1]>0 && count[suit][rank+2]>0){
                        shuntu = {
                            suit,
                            rank
                        };
                        return false;
                    }
                }
            }
        });
        if(kotu != null){
            //刻子
            const result = [];
            let num = 3;
            const deck2 = OrderedSet(deck.toArray().filter(tile=>{
                if(num>0 && tile.suit===kotu.suit && tile.rank===kotu.rank){
                    num--;
                    result.push(tile);
                    return false;
                }
                return true;
            }));
            return {
                ments: result,
                deck: deck2
            };
        }
        if(shuntu != null){
            //順子
            const result = [];
            let num = [1,1,1];
            const deck2 = OrderedSet(deck.toArray().filter(tile=>{
                if(tile.suit===shuntu.suit && num[tile.rank-shuntu.rank]===1){
                    num[tile.rank-shuntu.rank]=0;
                    result.push(tile);
                    return false;
                }
                return true;
            }));
            return {
                ments: result,
                deck: deck2
            };
        }
        throw new Error("面子が決まりませんでした");
    }
}

//util
function isJihai({suit}){
    return suit===SUIT_WIND || suit===SUIT_DRAGON;
}

