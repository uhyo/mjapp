import {random, dummy} from './draw';

const DRAW_SPEED = 135;

export default function init(){
    return (dispatch)=>{
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
            }
        }
    };
}
