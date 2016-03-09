//play
export const ACTION_RELEASE = 'ACTION_RELEASE';
export const ACTION_RON     = 'ACTION_RON';
export const ACTION_HAND_OPEN = 'ACTION_HAND_OPEN';
export const ACTION_SHOW_YAKU = 'ACTION_SHOW_YAKU';
export const ACTION_SHOW_POINT = 'ACTION_SHOW_POINT';

import {ron} from './state';

export function release(player, index){
    return (dispatch, getState)=>{
        //場に出す
        dispatch({
            type: ACTION_RELEASE,
            player,
            index
        });
        //ロン宣言
        setTimeout(()=>{
            dispatch(ron());
        }, 450);
        setTimeout(()=>{
            //手牌開示
            dispatch({
                type: ACTION_HAND_OPEN,
                player: 1
            });
        }, 1450);
        setTimeout(()=>{
            //得点
            dispatch({
                type: ACTION_SHOW_YAKU
            });
        }, 3000);
        setTimeout(()=>{
            //得点計算
            const {tile: {agari: {player, yakuman}}} = getState();
            //1役満=32000点
            const point = 32000 * yakuman.reduce((acc, [,count])=> acc+count, 0);
            dispatch({
                type: ACTION_SHOW_POINT,
                winner: player,
                point
            });
        }, 8000);
    };
}
