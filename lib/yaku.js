import {Seq, Set, OrderedSet} from 'immutable';
import {SUIT_CHARACTER, SUIT_CIRCLE, SUIT_BAMBOO,
        SUIT_WIND, SUIT_DRAGON, SUIT_UNKNOWN,
        RANK_WIND_E, RANK_WIND_S, RANK_WIND_W, RANK_WIND_N,
        RANK_DRAGON_W, RANK_DRAGON_G, RANK_DRAGON_R,
        tileName} from './tile';

import {sortTile} from './sort';

//役メーカー(tiles:Seq, deck:Set, yakuman:number)
export function randomYakuMaker(){
    return 大三元_その他;

    //三元牌をロン
    function 大三元_三元牌(discard, tiles, deck){
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
    //大三元（単騎待ち）
    function 大三元_単騎(discard, tiles, deck){
        const {suit:d_suit, rank:d_rank} = discard;
        if(d_suit===SUIT_DRAGON){
            return null;
        }
        //三元牌をカウント
        const count = {
            [RANK_DRAGON_W]:0,
            [RANK_DRAGON_G]:0,
            [RANK_DRAGON_R]:0,
            mati:0,
        };
        deck.forEach(({suit, rank})=>{
            if(suit===SUIT_DRAGON){
                count[rank]++;
            }else if(suit===d_suit && rank==d_rank){
                count.mati++;
            }
        });
        if(count[RANK_DRAGON_W]<3 || count[RANK_DRAGON_G]<3 || count[RANK_DRAGON_R]<3 || count.mati===0){
            //足りないので無理
            return null;
        }
        count[RANK_DRAGON_W]=count[RANK_DRAGON_G]=count[RANK_DRAGON_R]=3;
        count.mati=1;
        //三元牌と待ち牌を全部手牌に突っ込む
        const result=[];
        const deck2 = OrderedSet(deck.toArray().filter((tile)=>{
            const {suit, rank} = tile;
            if(suit===SUIT_DRAGON && count[rank]>0){
                count[rank]--;
                result.push(tile);
                return false;
            }else if(count.mati>0 && suit===d_suit && rank===d_rank){
                count.mati--;
                result.push(tile);
                return false;
            }
            return true;
        }));
        //あと面子ひとつ
        const {ments, deck:deck3} = takeArbitraryMents(deck2);
        result.push(...ments);
        //役
        let yakuman = [["大三元",1]];
        if(isJihai(discard) && isJihai(ments[0])){
            yakuman.push(["字一色",1]);
        }
        return {
            tiles: sortTile(Seq(result)),
            deck: deck3,
            yakuman
        };
    }
    function 大三元_その他(discard, tiles, deck){
        const {suit:d_suit, rank:d_rank} = discard;
        if(d_suit===SUIT_DRAGON){
            return null;
        }
        //三元牌をカウント
        const count = {
            [RANK_DRAGON_W]:0,
            [RANK_DRAGON_G]:0,
            [RANK_DRAGON_R]:0,
            mati:0,
        };
        deck.forEach(({suit, rank})=>{
            if(suit===SUIT_DRAGON){
                count[rank]++;
            }else if(suit===d_suit && rank==d_rank){
                count.mati++;
            }
        });
        if(count[RANK_DRAGON_W]<3 || count[RANK_DRAGON_G]<3 || count[RANK_DRAGON_R]<3 || count.mati===0){
            //足りないので無理
            return null;
        }
        count[RANK_DRAGON_W]=count[RANK_DRAGON_G]=count[RANK_DRAGON_R]=3;
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
        //雀頭をとる
        const {head, deck:deck3} = takeArbitraryHead(deck2);
        result.push(...head);

        //残りをとる
        const {mati, deck:deck4} = takeArbitraryMati(discard, deck3);
        result.push(...mati);

        //役をカウント
        let yakuman=[["大三元",1]];
        if(isJihai(head[0]) && isJihai(mati[0])){
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
    //待ち（搭子or対子）をとる
    function takeArbitraryMati({suit:d_suit, rank:d_rank}, deck){
        //スートごとにカウント
        const count = {};
        let tatu = null, toitu = null;
        const numbers = d_suit===SUIT_CHARACTER || d_suit===SUIT_CIRCLE || d_suit===SUIT_BAMBOO;
        deck.forEach(tile=>{
            const {suit, rank} = tile;
            if(suit===d_suit){
                count[rank] = (count[rank]||0)+1;
                if(rank===d_rank && count[rank]===2){
                    //対子
                    toitu = {
                        suit,
                        rank
                    };
                    return false;
                }
                if(numbers){
                    //順子候補
                    if(rank===d_rank-2){
                        if(count[d_rank-1]>0){
                            //両面or辺張
                            tatu = {
                                suit,
                                rank: d_rank-2
                            };
                            return false;
                        }
                    }
                    if(rank===d_rank-1){
                        if(count[d_rank-2]>0){
                            //両面or辺張
                            tatu = {
                                suit,
                                rank: d_rank-2
                            };
                            return false;
                        }
                        if(count[d_rank+1]>0){
                            //嵌張
                            tatu = {
                                suit,
                                rank: d_rank-1
                            };
                            return false;
                        }
                    }
                    if(rank===d_rank+1){
                        if(count[d_rank+2]>0){
                            //両面or辺張
                            tatu = {
                                suit,
                                rank: d_rank
                            };
                            return false;
                        }
                        if(count[d_rank-1]>0){
                            //嵌張
                            tatu = {
                                suit,
                                rank: d_rank-1
                            };
                            return false;
                        }
                    }
                    if(rank===d_rank+2){
                        if(count[d_rank+1]>0){
                            //両面or辺張
                            tatu = {
                                suit,
                                rank: d_rank
                            };
                            return false;
                        }
                    }
                }
            }
        });
        if(toitu != null){
            //対子
            const result = [];
            let num = 2;
            const deck2 = OrderedSet(deck.toArray().filter(tile=>{
                if(num>0 && tile.suit===toitu.suit && tile.rank===toitu.rank){
                    num--;
                    result.push(tile);
                    return false;
                }
                return true;
            }));
            return {
                mati: result,
                deck: deck2
            };
        }
        if(tatu != null){
            //搭子
            const result = [];
            let num = [1,1,1];
            const deck2 = OrderedSet(deck.toArray().filter(tile=>{
                if(tile.suit===tatu.suit && num[tile.rank-tatu.rank]===1 && tile.rank!==d_rank){
                    num[tile.rank-tatu.rank]=0;
                    result.push(tile);
                    return false;
                }
                return true;
            }));
            return {
                mati: result,
                deck: deck2
            };
        }
    }
}

//util
function isJihai({suit}){
    return suit===SUIT_WIND || suit===SUIT_DRAGON;
}

