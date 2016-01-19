import React from 'react';
import { connect } from 'react-redux';

import BoardFrame from '../components/board-frame.jsx';
import PointBoard from '../components/point-board.jsx';

class Board extends React.Component{
    render(){
        console.log(this.props);
        const {point}=this.props;
        return <BoardFrame>
            <p>{this.props.state}</p>
            <PointBoard point={point}/>
        </BoardFrame>;
    }
}

function select(store){
    return store;
}

export default connect(select)(Board);