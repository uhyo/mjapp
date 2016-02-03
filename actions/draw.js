//ドローする

export const ACTION_DRAW_RANDOM = 'ACTION_DRAW_RANDOM';
export const ACTION_DRAW_DUMMY = 'ACTION_DRAW_DUMMY';

export function random(player,num){
    return {
        type: ACTION_DRAW_RANDOM,
        player,
        num
    };
}

export function dummy(player,num){
    return {
        type: ACTION_DRAW_DUMMY,
        player,
        num
    };
}
