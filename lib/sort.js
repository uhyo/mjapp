//sorting tiles
import {SUIT_CHARACTER, SUIT_CIRCLE, SUIT_BAMBOO, SUIT_WIND, SUIT_DRAGON, SUIT_UNKNOWN} from './tile';

//ソート種類
export const SORT_MPSJ = 1;



export function sortTile(hand, mode = SORT_MPSJ){
    const func = sortMethod(mode);
    return hand.sort(func);
}

function sortMethod(mode){
    switch(mode){
        case SORT_MPSJ:
            return (a, b)=>{
                const suitMap = {
                    [SUIT_UNKNOWN]: -1,
                    [SUIT_CHARACTER]: 1,
                    [SUIT_CIRCLE]: 2,
                    [SUIT_BAMBOO]: 3,
                    [SUIT_WIND]: 4,
                    [SUIT_DRAGON]: 5
                };
                return (suitMap[a.suit] - suitMap[b.suit]) || (a.rank - b.rank) || (a.red - b.red);
            };
    }
}
