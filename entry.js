/* entry point */
import React from 'react';
import ReactDOM from 'react-dom';
import App from './jsx/containers/app.jsx';

import store from './store.js';
import initAction from './actions/init.js';

(()=>{
    require("./css/index.scss");
    const container=document.getElementById('mahjong-container');
    
    ReactDOM.render(React.createElement(App), container);

    store.dispatch(initAction());
})();
