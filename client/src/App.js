import React, { Component } from 'react';
import io from 'socket.io-client';

import Stocks from './Stocks';
import Message from './Message';
import History from './History';

import logo from './logo.svg';
import './App.css';

const stocksNames = ['AAPL','ABC','MSFT','TSLA','F'];

class App extends Component {

  componentDidMount() {
    this.socket = io('http://localhost:8000');
    stocksNames.forEach((stockName) =>
      this.socket.on(stockName, (value) => 
        this.setState({ [stockName]: value })
      )
    );
  }

  componentWillUnmount() {
    if (!this.socket) return;
    stocksNames.forEach((stockName) => this.socket.off(stockName));
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
        {state.message && <Message value={state.message} />}
        <Stocks onSelectStock={(stock) => this.setState({ selectedStock: stock }) } stocks={stocksNames.map(stockName => ({ l: stockName, c: state[stockName] }))} />
        {/*<Stocks stocks={stocksNames.map(stockName => state[stockName])} /> */}
        {state.selectedStock && <History value={state.histories[state.selectedStock]}/>}
      </div>
    );
  }
}

export default App;
