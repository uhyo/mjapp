import {combineReducers} from 'redux';
import stateReducer from './state';
import pointReducer from './point';
import tileReducer from './tile';

export default combineReducers({
    state: stateReducer,
    point: pointReducer,
    tile: tileReducer,
});
