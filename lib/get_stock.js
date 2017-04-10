'use strict';
const _ = require('lodash');
const redisClient = require('redis-connection')();
const redisSub = require('redis-connection')('subscriber');
const request = require('request');
const handleError = require('hapi-error').handleError;

const SocketIO = require('socket.io');
let io;

const pushStock = (data) => {
    console.log('save changes',data.t);
    _.extend(data,{timestamp: new Date()});
    let new_data =   JSON.stringify(data);
    redisClient.lpush(data.t,new_data);
    redisClient.publish(data.t,data.l); 
} 

const requireStock = (callback)=>{
        //get info from API: http://finance.google.com/finance/info?client=ig&q=AAPL,ABC,MSFT,TSLA,F
        request.get('http://finance.google.com/finance/info?client=ig&q=AAPL,ABC,MSFT,TSLA,F', function(err, res, content) {
                if (err) {
                    handleError(err);
                }
                switch(res.statusCode) {
                    case 200:
                        let new_content = content.replace('// ','');
                        let stocks = JSON.parse(new_content);
                        return callback(stocks); 
                    case 404: 
                       return '404 not found';
                    default:
                       return 'error 500';  
                }
        });
}

const compareStock = (stocks)=>{
        //console.log(stocks);
        
        _.each(stocks,function(stock){
                    console.log('stock.t',stock.t)
                    redisClient.lrange(stock.t,0,0,(err,data)=>{
                        if (err) {
                            //redisClient.del(stock.t);
                            console.log(err); 
                            return
                        }
                        //verify changes on data stock
                        try{
                            let data_json=JSON.parse(data);
                            console.log('diferentes?',stock.l,data_json.l,stock.l!=data_json.l)
                            if(stock.l!=data_json.l) pushStock(stock); //save changes in redis
                        } catch(e){
                            console.log('error');
                            pushStock(stock);
                        }
                }); 
        });
}

const getStockHandler = (socket)=>{
    
    console.log('getStockHandler');
    
    //compareStock(socket); 
    setInterval(()=>{
        requireStock(compareStock);
    },10000)
    //redisSub.subscribe('name');
    //socket.emit('name','lalala');
    //edisClient.publish('name', 'juan');
}

const init = (listener,callback)=>{
    redisClient.on('ready',()=>{
        redisSub.on('ready',()=>{
            redisSub.subscribe('AAPL');
            redisSub.subscribe('ABC');
            redisSub.subscribe('MSFT');
            redisSub.subscribe('TSLA');
            redisSub.subscribe('F');
            io = SocketIO.listen(listener);
            io.on('connection', getStockHandler);
            redisSub.on('message', function (channel, message) {
                console.log(channel + ' : ' + message);
                io.emit(channel, message); // relay to all connected socket.io clients
            });
            return setTimeout(function () {
                return callback();
            }, 300); // wait for socket to boot
        })
    });
}
module.exports = {
    init:init
}
