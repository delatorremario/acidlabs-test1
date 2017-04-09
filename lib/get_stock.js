'use strict';
const _ = require('lodash');
const redisClient = require('redis-connection')();
//const sub = require('redis-connection')('subscriber');
const request = require('request');
const handleError = require('hapi-error').handleError;

const SocketIO = require('socket.io');
let io;

const setStock = (data) => {
    redisClient.set(data.t, JSON.stringify(data));
} 

const requireStock = ()=>{
        //get info from API: http://finance.google.com/finance/info?client=ig&q=AAPL,ABC,MSFT,TSLA,F
        request.get('http://finance.google.com/finance/info?client=ig&q=AAPL,ABC,MSFT,TSLA,F', function(err, res, content) {
                if (err) {
                    handleError(err);
                }
                switch(res.statusCode) {
                    case 200:
                        let new_content = content.replace('// ','');
                        let stocks = JSON.parse(new_content);
                        _.each(stocks,(e)=>setStock(e))
                       return redisClient.set('last_require', new_content); 
                    case 404: 
                       return '404 not found';
                    default:
                       return 'error 500';  
                }
        });
}
const compareStock = (socket)=>{
    redisClient.get('last_require', (err, reply) => {
       if(reply){
            let stocks = JSON.parse(reply);
            //console.log('stocks',stocks[0]);
            _.forEach(stocks,function(stock){
                console.log('stock', stock);
            })
           
       } 
       //socket.emit('stock',reply.toString());
    });
    
}

const getStockHandler = (socket)=>{
    requireStock();
    compareStock(socket); 
    setInterval(()=>{
        
    },1000)
        
}

const init = (listener,callback)=>{
      io = SocketIO.listen(listener);
      io.on('connection', getStockHandler);
     
      //return setTimeout(function () {
        return callback();
      //}, 300); // wait for socket to boot
}
module.exports = {
    init:init
}
