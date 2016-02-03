//lib tile

//suit
export const SUIT_CHARACTER = 1;    //萬子
export const SUIT_CIRCLE    = 2;    //筒子
export const SUIT_BAMBOO    = 3;    //索子
export const SUIT_WIND      = 4;    //風牌
export const SUIT_DRAGON    = 5;    //三元牌
export const SUIT_UNKNOWN   = 6;    //裏

//special rank
export const RANK_WIND_E    = 1;    //東
export const RANK_WIND_S    = 2;    //南
export const RANK_WIND_W    = 3;    //西
export const RANK_WIND_N    = 4;    //北
export const RANK_DRAGON_W  = 1;    //白
export const RANK_DRAGON_G  = 2;    //発
export const RANK_DRAGON_R  = 3;    //中

//牌の画像
export function tileImage({suit, rank, red}){
    const redstr = red ? "r" : "";
    switch(suit){
        case SUIT_CHARACTER:
            return require("url!../images/"+rank+"m"+redstr+".png");
        case SUIT_CIRCLE:
            return require("url!../images/"+rank+"p"+redstr+".png");
        case SUIT_BAMBOO:
            return require("url!../images/"+rank+"s"+redstr+".png");
        case SUIT_WIND:
            return require("url!../images/w"+rank+".png");
        case SUIT_DRAGON:
            return require("url!../images/d"+rank+".png");
        default:
            return "";
    }
}

//牌の名前
export function tileName({suit, rank, red}){
    const redstr = red ? "赤" : "";
    switch(suit){
        case SUIT_CHARACTER:
            return redstr+ranknum(rank)+"萬";
        case SUIT_CIRCLE:
            return redstr+ranknum(rank)+"筒";
        case SUIT_BAMBOO:
            return redstr+ranknum(rank)+"索";
        case SUIT_WIND:
            switch(rank){
                case RANK_WIND_E:
                    return "東";
                case RANK_WIND_S:
                    return "南";
                case RANK_WIND_W:
                    return "西";
                case RANK_WIND_N:
                    return "北";
            }
        case SUIT_DRAGON:
            switch(rank){
                case RANK_DRAGON_W:
                    return "白";
                case RANK_DRAGON_G:
                    return "發";
                case RANK_DRAGON_R:
                    return "中"
            }
        default:
            return "";
    }

    function ranknum(rank){
        return ["一","二","三","四","五","六","七","八","九"][rank-1];
    }
}
