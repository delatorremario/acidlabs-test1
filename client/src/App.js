import React, { Component } from 'react';
import io from 'socket.io-client';

import Stock from './Stock';

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

  state = {};

  render() {
    const state = this.state;
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        {stocksNames.map(stockName =>
          <Stock key={stockName} name={stockName} value={this.state[stockName]}/>
        )}
      </div>
    );
  }
}

export default App;
