import {random, dummy, dora} from './draw';
import {playing} from './state';
import {sort} from './sort';
import {SORT_MPSJ} from '../lib/sort';

export const ACTION_INIT = 'ACTION_INIT';

const DRAW_SPEED = 135;

export default function init(){
    return (dispatch)=>{
        dispatch({
            type: ACTION_INIT
        });
        // 開始：4人順番にドローする
        let player=0, turn=0;

        setTimeout(step, 500);

        function step(){
            //自分は牌をドローするけどほかはダミー
            if(player===0){
                dispatch(random(0, turn<3 ? 4 : 2));
            }else{
                dispatch(dummy(player, turn<3 ? 4 : 1));
            }
            player++;
            if(player===4){
                turn++;
                player=0;
            }
            if(turn<4){
                setTimeout(step, DRAW_SPEED);
            }else{
                setTimeout(step2, DRAW_SPEED);
            }
        }

        function step2(){
            dispatch(dora());
            dispatch(sort(SORT_MPSJ));
            dispatch(playing());
        }
    };
}
