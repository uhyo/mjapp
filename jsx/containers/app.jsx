import React from 'react';
import { Provider } from 'react-redux';
import store from '../../store';

import Board from './board.jsx';

class App extends React.Component{
    render(){
        return <Provider store={store}>
            <Board/>
        </Provider>;
    }
}

export default App;

