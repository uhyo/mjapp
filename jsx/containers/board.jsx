import React from 'react';
import { connect } from 'react-redux';

import BoardFrame from '../components/board-frame.jsx';
import PointBoard from '../components/point-board.jsx';
import Tiles from './tiles.jsx';
import Effect from './effect.jsx';

class Board extends React.Component{
    render(){
        const {point}=this.props;
        return <BoardFrame>
            <p>{this.props.state}</p>
            <PointBoard point={point}/>
            <Tiles/>
            <Effect/>
        </BoardFrame>;
    }
}

const select = store => store;

export default connect(select)(Board);

