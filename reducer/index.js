import {combineReducers} from 'redux';
import stateReducer from './state';
import pointReducer from './point';

export default combineReducers({
    state: stateReducer,
    point: pointReducer
});
