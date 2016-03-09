//Stateを変える
export const ACTION_STATE_PLAYING = 'ACTION_STATE_PLAYING';
export const ACTION_STATE_RON     = 'ACTION_STATE_ROM';

export function playing(){
    return {
        type: ACTION_STATE_PLAYING
    };
}

export function ron(){
    return {
        type: ACTION_STATE_RON
    };
}
