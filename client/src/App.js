import React, { Component } from 'react';
import io from 'socket.io-client';

import Stocks from './Stocks';
import Message from './Message';
import History from './History';
import Error from './Error';
import './App.css';

const stocksNames = ['AAPL','ABC','MSFT','TSLA','F'];

class App extends Component {

  componentDidMount() {
    this.socket = io('http://localhost:8000');
    this.socket.on('connect', function(){console.log('connect')});
    this.socket.on('disconnect', function(){console.log('disconnect')});
    stocksNames.forEach((stockName) =>
      this.socket.on(stockName, (value) => {
        this.setState({ [stockName]: value })
      })
    );
    this.socket.on('error',(error) => {
        this.setState({['error']:error})
    });
  }

  componentWillUnmount() {
    if (!this.socket) return;
    stocksNames.forEach((stockName) => this.socket.off(stockName));
    this.socket.off('error');
  }

  state = {
    histories:{
      'AAPL':[{timestamp:new Date()}],
      'ABC':[],
      'MSFT':[],
      'TSLA':[],
      'F':[]
    },
    selectedStock:null
  };


  render() {
    const state = this.state; 
    return (
      <div className="App">
        <div className="App-header">
          <h2>Test for AcidLabs</h2>
        </div>
            {state.error && state.error.show===true && <Error error={state.error} />}
            {state.message && <Message value={state.message} />}
            <Stocks onSelectStock={(stock) => this.setState({ selectedStock: stock }) } stocks={stocksNames.map(stockName =>  state[stockName] )} />
            {state.selectedStock && <History value={state.histories[state.selectedStock]}/>}
      </div>
    );
  }
}

export default App;
