import {Seq, Set, OrderedSet} from 'immutable';
import {SUIT_CHARACTER, SUIT_CIRCLE, SUIT_BAMBOO,
        SUIT_WIND, SUIT_DRAGON, SUIT_UNKNOWN,
        RANK_WIND_E, RANK_WIND_S, RANK_WIND_W, RANK_WIND_N,
        RANK_DRAGON_W, RANK_DRAGON_G, RANK_DRAGON_R
        } from './tile';

import {sortTile} from './sort';

//役メーカー(tiles:Seq, deck:Set, yakuman:number)
export function randomYakuMaker(){
    return 小四喜_その他;

    //国士無双
    function 国士無双(discard, tiles, deck){
        //役の成立条件
        const {suit:d_suit, rank:d_rank} = discard;
        //牌カウント
        const count = {
            [SUIT_CHARACTER]:{
                "1":0,
                "9":0
            },
            [SUIT_CIRCLE]:{
                "1":0,
                "9":0
            },
            [SUIT_BAMBOO]:{
                "1":0,
                "9":0
            },
            [SUIT_WIND]:{
                [RANK_WIND_E]:0,
                [RANK_WIND_S]:0,
                [RANK_WIND_W]:0,
                [RANK_WIND_N]:0
            },
            [SUIT_DRAGON]:{
                [RANK_DRAGON_W]:0,
                [RANK_DRAGON_G]:0,
                [RANK_DRAGON_R]:0
            }
        };
        if(count[d_suit]==null || count[d_suit][d_rank]==null){
            //国士無双の構成牌ではない
            return null;
        }
        count[d_suit][d_rank]++;

        let double_flag = false;
        let taken_count = 0;
        const result = [];
        const deck2 = OrderedSet(deck.toArray().filter((tile)=>{
            const {suit, rank} = tile;
            if(count[suit]!=null && taken_count<13){
                if(count[suit][rank]===0){
                    //1枚目
                    count[suit][rank]++;
                    taken_count++;
                    result.push(tile);
                    return false;
                }
                if(double_flag===false && count[suit][rank]===1){
                    count[suit][rank]++;
                    double_flag=true;
                    taken_count++;
                    result.push(tile);
                    return false;
                }
            }
            return true;
        }));
        if(taken_count<13){
            //足りない
            return null;
        }
        return {
            tiles: result,
            deck: deck2
        };
    }
    //四暗刻（単騎）
    function 四暗刻(discard, tiles, deck){
        const {suit:d_suit, rank:d_rank} = discard;
        const result = [];
        //待ちをとる
        let t_flag = false;
        const deck2 = OrderedSet(deck.toArray().filter((tile)=>{
            const {suit, rank} = tile;
            if(t_flag===false && suit===d_suit && rank===d_rank){
                t_flag=true;
                result.push(tile);
                return false;
            }
            return true;
        }));
        deck = deck2;
        //4刻子とる
        for(let i=0; i<4; i++){
            const {ments, deck:deck2} = takeArbitraryMents(deck, {kotu: true, shuntu: false});
            result.push(...ments);
            deck = deck2;
        }

        return {
            tiles: result,
            deck
        };
    }


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

        return {
            tiles: result,
            deck: deck4
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

        return {
            tiles: result,
            deck: deck3
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

        return {
            tiles: result,
            deck: deck4
        };
    }
    function 大四喜_風牌(discard, tiles, deck){
        //役の成立条件
        const {suit:d_suit, rank:d_rank} = discard;
        if(d_suit!==SUIT_WIND){
            return null;
        }
        //残っている牌カウント
        const count = {
            [RANK_WIND_E]:3,
            [RANK_WIND_S]:3,
            [RANK_WIND_W]:3,
            [RANK_WIND_N]:3,
        };
        count[d_rank]--;
        const result=[];
        let cnt=0;
        const deck2 = OrderedSet(deck.toArray().filter((tile)=>{
            const {suit, rank} = tile;
            if(suit===SUIT_WIND){
                if(count[rank]>0){
                    count[rank]--;
                    cnt++;
                    result.push(tile);
                    return false;
                }
            }
            return true;
        }));
        if(cnt<11){
            //風牌がたりないのでだめ
            return null;
        }
        //雀頭をとる
        const {head, deck:deck3} = takeArbitraryHead(deck2);
        result.push(...head);

        return {
            tiles: result,
            deck: deck3
        };
    }
    function 大四喜_単騎(discard, tiles, deck){
        //役の成立条件
        const {suit:d_suit, rank:d_rank} = discard;
        if(d_suit===SUIT_WIND){
            return null;
        }
        //残っている牌カウント
        const count = {
            [RANK_WIND_E]:3,
            [RANK_WIND_S]:3,
            [RANK_WIND_W]:3,
            [RANK_WIND_N]:3,
            mati:1
        };
        const result=[];
        let cnt=0;
        const deck2 = OrderedSet(deck.toArray().filter((tile)=>{
            const {suit, rank} = tile;
            if(suit===SUIT_WIND){
                if(count[rank]>0){
                    count[rank]--;
                    cnt++;
                    result.push(tile);
                    return false;
                }
            }else if(suit===d_suit && rank===d_rank && count.mati>0){
                count.mati--;
                cnt++;
                result.push(tile);
                return false;
            }
            return true;
        }));
        if(cnt<13){
            //これで全部とったはず
            return null;
        }
        return {
            tiles: result,
            deck: deck2
        };
    }
    function 小四喜_単騎(discard, tiles, deck){
        //役の成立条件
        const {suit:d_suit, rank:d_rank} = discard;
        if(d_suit!==SUIT_WIND){
            return null;
        }
        //残っている牌カウント
        const count = {
            [RANK_WIND_E]:3,
            [RANK_WIND_S]:3,
            [RANK_WIND_W]:3,
            [RANK_WIND_N]:3,
        };
        count[d_rank]=1;
        const result=[];
        let cnt=0;
        const deck2 = OrderedSet(deck.toArray().filter((tile)=>{
            const {suit, rank} = tile;
            if(suit===SUIT_WIND){
                if(count[rank]>0){
                    count[rank]--;
                    cnt++;
                    result.push(tile);
                    return false;
                }
            }
            return true;
        }));
        if(cnt<10){
            //風牌がたりないのでだめ
            return null;
        }
        //面子をひとつつくる
        const {ments, deck:deck3} = takeArbitraryMents(deck2);
        result.push(...ments);

        return {
            tiles: result,
            deck: deck3
        };
    }
    function 小四喜_その他(discard, tiles, deck){
        //役の成立条件
        const {suit:d_suit, rank:d_rank} = discard;
        if(d_suit===SUIT_WIND){
            return null;
        }
        //風牌をとっていく
        const count = {
            [RANK_WIND_E]:0,
            [RANK_WIND_S]:0,
            [RANK_WIND_W]:0,
            [RANK_WIND_N]:0,
        };
        const result=[];
        let cnt=0;
        let threes=0;
        const deck2 = OrderedSet(deck.toArray().filter((tile)=>{
            const {suit, rank} = tile;
            if(suit===SUIT_WIND){
                //3種類が3枚になるまでは取っていく
                if(count[rank]<3 && (count[rank]<2 || threes<3)){
                    if(++count[rank] === 3){
                        threes++;
                    }
                    cnt++;
                    result.push(tile);
                    return false;
                }
            }
            return true;
        }));
        if(cnt<11){
            //風牌を全部で11枚取っていればいい
            return null;
        }
        //待ちをつくる
        const {mati, deck:deck3} = takeArbitraryMati(discard, deck2);
        result.push(...mati);

        return {
            tiles: result,
            deck: deck3
        };
    }



    //
    //util function
    function takeArbitraryHead(deck){
        const count={};
        deck.forEach(tile=>{
            const name = tileString(tile);
            count[name] = (count[name]||0)+1;
        });
        let num = 2;
        const result=[];
        for(let name in count){
            if(count[name]>=2){
                //これを採用する
                const deck2 = OrderedSet(deck.toArray().filter(tile=>{
                    if(num>0 && tileString(tile)===name){
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
    function takeArbitraryMents(deck, options = {kotu: true, shuntu: true}){
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
                if(count[suit][rank]===3 && options.kotu){
                    //刻子がそろった
                    kotu = {
                        suit,
                        rank
                    };
                    return false;
                }
                if((suit===SUIT_CHARACTER || suit===SUIT_CIRCLE || suit===SUIT_BAMBOO) && options.shuntu){
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
    function takeArbitraryMati({suit:d_suit, rank:d_rank}, deck, options = {tatu: true, toitu: true}){
        //スートごとにカウント
        const count = {};
        let tatu = null, toitu = null;
        const numbers = d_suit===SUIT_CHARACTER || d_suit===SUIT_CIRCLE || d_suit===SUIT_BAMBOO;
        deck.forEach(tile=>{
            const {suit, rank} = tile;
            if(suit===d_suit){
                count[rank] = (count[rank]||0)+1;
                if(rank===d_rank && count[rank]===2 && options.toitu){
                    //対子
                    toitu = {
                        suit,
                        rank
                    };
                    return false;
                }
                if(numbers && options.tatu){
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
//13牌+和了牌の役を判定
export function checkYakuman(tiles, discard){
    const funcs= [
        ["国士無双", is国士無双],
        ["四暗刻", is四暗刻],
        ["大三元", is大三元],
        ["大四喜", is大四喜],
        ["小四喜", is小四喜],
        ["字一色", is字一色]
    ];
    const result = [];
    funcs.forEach(([name, func])=>{
        if(func(tiles, discard)){
            result.push([name, 1]);
        }
    });
    return result;
}
function is国士無双(tiles, discard){
    const count = {
        [SUIT_CHARACTER]:{
            "1":0,
            "9":0
        },
        [SUIT_CIRCLE]:{
            "1":0,
            "9":0
        },
        [SUIT_BAMBOO]:{
            "1":0,
            "9":0
        },
        [SUIT_WIND]:{
            [RANK_WIND_E]:0,
            [RANK_WIND_S]:0,
            [RANK_WIND_W]:0,
            [RANK_WIND_N]:0
        },
        [SUIT_DRAGON]:{
            [RANK_DRAGON_W]:0,
            [RANK_DRAGON_G]:0,
            [RANK_DRAGON_R]:0
        }
    };
    let double_flag = true;
    tiles = tiles.concat([discard]);
    for(let i=0; i<14; i++){
        const {suit, rank} = tiles[i];
        const cs=count[suit];
        if(cs==null){
            return false;
        }
        if(cs[rank]===0){
            cs[rank]++;
        }else if(cs[rank]===1 && double_flag){
            cs[rank]++;
            double_flag=false;
        }else{
            return false;
        }
    }
    return true;
}
function is四暗刻(tiles, discard){
    //4刻子+雀頭
    const count={};
    tiles.forEach((tile)=>{
        const n = tileString(tile);
        count[n] = (count[n] || 0)+1;
    });
    let cnt = 0;
    let atama = null;
    for(let name in count){
        cnt++;
        if(count[name]===1){
            if(atama==null){
                atama = name;
            }else{
                return false;
            }
        }else if(count[name]!==3){
            return false;
        }
    }
    return cnt===5 && atama===tileString(discard);
}
function is大三元(tiles, discard){
    const count = {
        [RANK_DRAGON_W]:0,
        [RANK_DRAGON_G]:0,
        [RANK_DRAGON_R]:0
    };
    tiles.concat([discard]).forEach(({suit, rank})=>{
        if(suit===SUIT_DRAGON){
            count[rank]++;
        }
    });
    return count[RANK_DRAGON_W]>=3 && count[RANK_DRAGON_G]>=3 && count[RANK_DRAGON_R]>=3;
}
function is大四喜(tiles, discard){
    const count = {
        [RANK_WIND_E]:0,
        [RANK_WIND_S]:0,
        [RANK_WIND_W]:0,
        [RANK_WIND_N]:0
    };
    tiles.concat([discard]).forEach(({suit, rank})=>{
        if(suit===SUIT_WIND){
            count[rank]++;
        }
    });
    return count[RANK_WIND_E]>=3 && count[RANK_WIND_S]>=3 && count[RANK_WIND_W]>=3 && count[RANK_WIND_N]>=3;
}
function is小四喜(tiles, discard){
    //大四喜のときは小四喜ではない
    const count = {
        [RANK_WIND_E]:0,
        [RANK_WIND_S]:0,
        [RANK_WIND_W]:0,
        [RANK_WIND_N]:0
    };
    tiles.concat([discard]).forEach(({suit, rank})=>{
        if(suit===SUIT_WIND){
            count[rank]++;
        }
    });
    let two_flag = false;
    for(let rank in count){
        if(count[rank]===2 && two_flag===false){
            two_flag=true;
        }else if(count[rank]!==3){
            return false;
        }
    }
    return true;
}
function is字一色(tiles, discard){
    return tiles.every(isJihai) && isJihai(discard);
}
function isJihai({suit}){
    return suit===SUIT_WIND || suit===SUIT_DRAGON;
}
function tileString({suit, rank}){
    return `${suit}:${rank}`;
}
