//application state
import {ACTION_STATE_PLAYING, ACTION_STATE_RON} from '../actions/state';
import {ACTION_RELEASE, ACTION_HAND_OPEN, ACTION_SHOW_YAKU, ACTION_SHOW_POINT} from '../actions/play';

export const STATE_INIT    = 'STATE_INIT';
export const STATE_PLAYING = 'STATE_PLAYING';
export const STATE_PLAYING2= 'STATE_PLAYING2';
export const STATE_RON     = 'STATE_RON';
export const STATE_OPENING = 'STATE_OPENING';
export const STATE_SHOW_YAKU = 'STATE_SHOW_YAKU';
export const STATE_SHOW_POINT = 'STATE_SHOW_POINT';

export default function reducer(state = STATE_INIT, action){
    switch(action.type){
        case ACTION_STATE_PLAYING:
            return STATE_PLAYING;
        case ACTION_RELEASE:
            return STATE_PLAYING2;
        case ACTION_STATE_RON:
            return STATE_RON;
        case ACTION_HAND_OPEN:
            return STATE_OPENING;
        case ACTION_SHOW_YAKU:
            return STATE_SHOW_YAKU;
        case ACTION_SHOW_POINT:
            return STATE_SHOW_POINT;
        default:
            return state;
    }
}
