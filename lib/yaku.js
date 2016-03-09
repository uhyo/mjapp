import {Seq, Set, OrderedSet} from 'immutable';
import {SUIT_CHARACTER, SUIT_CIRCLE, SUIT_BAMBOO,
        SUIT_WIND, SUIT_DRAGON, SUIT_UNKNOWN,
        RANK_WIND_E, RANK_WIND_S, RANK_WIND_W, RANK_WIND_N,
        RANK_DRAGON_W, RANK_DRAGON_G, RANK_DRAGON_R
        } from './tile';

import {sortTile} from './sort';

//確率分布

//役メーカー(tiles:Seq, deck:Set, yakuman:number)
export function randomYakuMaker(){
    const bunpu = [
        [15, 国士無双],
        [6, 四暗刻],
        [12, 大三元_三元牌],
        [6, 大三元_単騎],
        [8, 大三元_その他],
        [3, 大四喜_風牌],
        [2, 大四喜_単騎],
        [4, 小四喜_単騎],
        [4, 小四喜_その他],
        [12, 字一色_普通],
        [4, 字一色_七対子],
        [4, 緑一色_単騎],
        [4, 緑一色_その他],
        [8, 清老頭],
        [4, 九蓮宝燈]
    ];
    const sum = bunpu.reduce((prev, [num,])=>prev+num, 0);
    //一様分布
    let val = Math.random()*sum;
    for(let i=0, l=bunpu.length; i<l; i++){
        const [num, func] = bunpu[i];
        val -= num;
        if(val<0){
            return func;
        }
    }

    return 九蓮宝燈;

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
    function 字一色_普通(discard, tiles, deck){
        //役の成立条件
        const {suit:d_suit, rank:d_rank} = discard;
        if(d_suit!==SUIT_WIND && d_suit!==SUIT_DRAGON){
            //字牌でないとだめ
            return null;
        }
        const dname = tileString(discard);
        //牌カウント
        const count = {
            [dname]: 1
        };
        let threes=0, twos=0;  //2枚/3枚あるやつを数える
        let threeNames = [], twoNames = [];
        deck.forEach((tile)=>{
            const {suit, rank} = tile;
            if(suit===SUIT_DRAGON || suit===SUIT_WIND){
                const n = tileString(tile);
                const c = count[n]==null ? count[n]=1 : ++count[n];
                if(c===2){
                    twos++;
                    twoNames.push(n)
                }else if(c===3){
                    threes++;
                    threeNames.push(n);
                }
            }
        });
        if(threes<4 || twos<5){
            //字牌がたりない
            return null;
        }
        //雀頭にする牌と刻子にする牌を決める
        twoNames = twoNames.filter(n => threeNames.indexOf(n)===-1);
        if(twoNames.length===0){
            twoNames = [threeNames.pop()];
        }else if(twoNames.indexOf(dname)>=0){
            //待ちは入れたい
            twoNames = [dname];
        }else{
            twoNames = twoNames.slice(0,1);
        }
        if(threeNames.indexOf(dname)>=0){
            //こちらにあれば入れる
            threeNames = [dname].concat(threeNames.filter(n => n!==dname).slice(0, 3));
        }else{
            threeNames = threeNames.slice(0, 4);
        }
        //合併する
        twoNames = twoNames.concat(threeNames);

        twoNames.forEach(n => count[n]=0);
        count[dname]=1;


        let cnt = 0;
        const result = [];
        const deck2 = OrderedSet(deck.toArray().filter((tile)=>{
            const {suit, rank} = tile;
            const n = tileString(tile);
            if(count[n]!=null && cnt<13){
                if(twoNames.indexOf(n)>=0 && count[n]<3){
                    count[n]++;
                    cnt++;
                    result.push(tile);
                    return false;
                }
            }
            return true;
        }));
        return {
            tiles: result,
            deck: deck2
        };
    }
    function 字一色_七対子(discard, tiles, deck){
        //役の成立条件
        const {suit:d_suit, rank:d_rank} = discard;
        if(d_suit!==SUIT_WIND && d_suit!==SUIT_DRAGON){
            //字牌でないとだめ
            return null;
        }
        const dname = tileString(discard);
        //牌カウント
        const count = {
            [dname]: 1
        };
        //全部2枚以上ないとだめ
        let twos=0;
        deck.forEach((tile)=>{
            const {suit} = tile;
            if(suit===SUIT_DRAGON || suit===SUIT_WIND){
                const n = tileString(tile);
                const c = count[n]==null ? count[n]=1 : ++count[n];
                if(c===2){
                    twos++;
                }
            }
        });
        if(twos < 7){
            //字牌がたりない
            return null;
        }
        for(let n in count){
            count[n]=0;
        }
        count[dname]=1;

        const result = [];
        const deck2 = OrderedSet(deck.toArray().filter((tile)=>{
            const {suit} = tile;
            const n = tileString(tile);
            if((suit===SUIT_WIND || suit===SUIT_DRAGON) && count[n]<2){
                count[n]++;
                result.push(tile);
                return false;
            }
            return true;
        }));
        return {
            tiles: result,
            deck: deck2
        };
    }
    function 緑一色_単騎(discard, tiles, deck){
        //緑じゃないとだめ
        if(!isGreen(discard)){
            return null;
        }
        const {suit: d_suit, rank:d_rank} = discard;
        //雀頭にする
        let cnt = 0;
        const result=[];
        deck = OrderedSet(deck.toArray().filter((tile)=>{
            const {suit, rank} = tile;
            if(cnt===0 && suit===d_suit && rank===d_rank){
                cnt++;
                result.push(tile);
                return false;
            }
            return true;
        }));
        //緑の面子を4つ取る
        for(let i=0; i<4; i++){
            const {ments, deck:deck2} = takeArbitraryMents(deck, {kotu: true, shuntu: true, filter: isGreen});
            result.push(...ments);
            deck = deck2;
        }
        return {
            tiles: result,
            deck
        };
    }
    function 緑一色_その他(discard, tiles, deck){
        //緑じゃないとだめ
        if(!isGreen(discard)){
            return null;
        }
        const result=[];
        //待ちを取る
        const {mati, deck:deck2} = takeArbitraryMati(discard, deck, {tatu: true, toitu: true, filter: isGreen});
        result.push(...mati);
        //雀頭を取る
        const {head, deck:deck3} = takeArbitraryHead(deck2, {filter: isGreen});
        deck = deck3;
        result.push(...head);
        //面子を3つ取る
        for(let i=0; i<3; i++){
            const {ments, deck:deck2} = takeArbitraryMents(deck, {kotu: true, shuntu: true, filter: isGreen});
            result.push(...ments);
            deck = deck2;
        }
        return {
            tiles: result,
            deck
        };
    }
    function 清老頭(discard, tiles, deck){
        //役の成立条件
        const {suit:d_suit, rank:d_rank} = discard;
        if(!is19(discard)){
            //字牌でないとだめ
            return null;
        }
        const dname = tileString(discard);
        //牌カウント
        const count = {
            [dname]: 1
        };
        let threes=0, twos=0;  //2枚/3枚あるやつを数える
        let threeNames = [], twoNames = [];
        deck.filter(is19).forEach((tile)=>{
            const n = tileString(tile);
            const c = count[n]==null ? count[n]=1 : ++count[n];
            if(c===2){
                twos++;
                twoNames.push(n)
            }else if(c===3){
                threes++;
                threeNames.push(n);
            }
        });
        if(threes<4 || twos<5){
            return null;
        }
        //雀頭にする牌と刻子にする牌を決める
        twoNames = twoNames.filter(n => threeNames.indexOf(n)===-1);
        if(twoNames.length===0){
            twoNames = [threeNames.pop()];
        }else if(twoNames.indexOf(dname)>=0){
            //待ちは入れたい
            twoNames = [dname];
        }else{
            twoNames = twoNames.slice(0,1);
        }
        if(threeNames.indexOf(dname)>=0){
            //こちらにあれば入れる
            threeNames = [dname].concat(threeNames.filter(n => n!==dname).slice(0, 3));
        }else{
            threeNames = threeNames.slice(0, 4);
        }
        //合併する
        twoNames = twoNames.concat(threeNames);

        twoNames.forEach(n => count[n]=0);
        count[dname]=1;


        let cnt = 0;
        const result = [];
        const deck2 = OrderedSet(deck.toArray().filter((tile)=>{
            const n = tileString(tile);
            if(count[n]!=null && cnt<13){
                if(twoNames.indexOf(n)>=0 && count[n]<3){
                    count[n]++;
                    cnt++;
                    result.push(tile);
                    return false;
                }
            }
            return true;
        }));
        return {
            tiles: result,
            deck: deck2
        };
    }
    function 九蓮宝燈(discard, tiles, deck){
        //役の成立条件
        const {suit:d_suit, rank:d_rank} = discard;
        if(d_suit===SUIT_WIND || d_suit===SUIT_DRAGON){
            //数牌でないとだめ
            return null;
        }
        //牌カウント
        const count = {
            [d_rank]: 1
        };
        let cnt = 1;
        deck.forEach(({suit, rank})=>{
            if(suit===d_suit){
                count[rank] = (count[rank] || 0) + 1;
                cnt++;
            }
        });
        //全体数が足りないと無理（ひとつ余裕持たせる）
        if(cnt<15){
            return null;
        }
        //個別に足りないかチェック
        if(count[1]<3 || count[2]<1 || count[3]<1 || count[4]<1 || count[5]<1 || count[6]<1 || count[7]<1 || count[8]<1 || count[9]<3){
            return false;
        }
        //取っていく
        count[1]=count[2]=count[3]=count[4]=count[5]=count[6]=count[7]=count[8]=count[9]=0;
        count[d_rank]=1;

        let over_flg = false;
        const result = [];
        const deck2 = OrderedSet(deck.toArray().filter((tile)=>{
            const {suit, rank} = tile;
            if(suit===d_suit){
                if(rank===1 || rank===9){
                    if(count[rank]<3){
                        count[rank]++;
                        result.push(tile);
                        return false;
                    }else if(count[rank]<4 && over_flg===false){
                        over_flg=true;
                        count[rank]++;
                        result.push(tile);
                        return false;
                    }
                }else{
                    if(count[rank]<1){
                        count[rank]++;
                        result.push(tile);
                        return false;
                    }else if(count[rank]<2 && over_flg===false){
                        over_flg=true;
                        count[rank]++;
                        result.push(tile);
                        return false;
                    }
                }
            }
            return true;
        }));
        return {
            tiles: result,
            deck: deck2
        };
    }




    //
    //util function
    function takeArbitraryHead(deck, options = {filter: null}){
        const count={};
        const filter = options.filter || ((_)=>true);
        deck.filter(filter).forEach(tile=>{
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
        const filter = options.filter || ((_)=>true);
        deck.filter(filter).forEach(tile=>{
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
        const filter = options.filter || ((_)=>true);
        deck.filter(filter).forEach(tile=>{
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
        ["字一色", is字一色],
        ["緑一色", is緑一色],
        ["清老頭", is清老頭],
        ["九蓮宝燈", is九蓮宝燈],
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
    return two_flag;
}
function is字一色(tiles, discard){
    return tiles.every(isJihai) && isJihai(discard);
}
function is緑一色(tiles, discard){
    return tiles.every(isGreen) && isGreen(discard);
}
function is清老頭(tiles, discard){
    return tiles.every(is19) && is19(discard);
}
function is九蓮宝燈(tiles, discard){
    const count={};
    //全部同じスートで数牌であることを確認
    tiles.concat([discard]).forEach(({suit})=> count[suit] = (count[suit] || 0) +1);
    if(count[discard.suit]<14 || discard.suit===SUIT_WIND || discard.suit===SUIT_DRAGON){
        return false;
    }
    //1112345678999+Xの形を確認
    const count2={};
    let flag_ok = true;
    let flag_over = false;
    tiles.concat([discard]).forEach(({rank})=>{
        const c = count2[rank] = (count2[rank]||0)+1;
        if(rank===1 || rank===9){
            if(c>3){
                if(flag_over===false){
                    flag_over=true;
                }else{
                    flag_ok=false;
                }
            }
        }else if(c>1){
            if(flag_over===false){
                flag_over=true;
            }else{
                flag_ok=false;
            }
        }
    });
    return flag_ok;
}
function isJihai({suit}){
    return suit===SUIT_WIND || suit===SUIT_DRAGON;
}
function isGreen({suit, rank}){
    return suit===SUIT_DRAGON && rank===RANK_DRAGON_G ||
           suit===SUIT_BAMBOO && (rank===2 || rank===3 || rank===4 || rank===6 || rank===8);
}
function is19({suit, rank}){
    return (suit===SUIT_CHARACTER || suit===SUIT_CIRCLE || suit===SUIT_BAMBOO) && (rank===1 || rank===9);
}
function tileString({suit, rank}){
    return `${suit}:${rank}`;
}
