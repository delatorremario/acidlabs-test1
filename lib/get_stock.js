'use strict';
const _ = require('lodash');
const redisClient = require('redis-connection')();
const redisSub = require('redis-connection')('subscriber');
const request = require('request');
const handleError = require('hapi-error').handleError;

const SocketIO = require('socket.io');
let io;

const stocks_names =   ['AAPL','ABC','MSFT','TSLA','F'];

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
                       return handleError('404 not found');
                    default:
                       return handleError('error 500');  
                }
        });
}

const compareStock = (stocks)=>{
        //console.log(stocks);
        
        _.each(stocks,function(stock){
                   redisClient.lrange(stock.t,0,0,(err,data)=>{
                        if (err) {
                            redisClient.del(stock.t);
                            return handleError(err);
                        }
                        //verify changes on data stock
                        try{
                            let data_json=JSON.parse(data);
                            if(stock.l!=data_json.l) pushStock(stock); //save changes in redis
                        } catch(e){
                            handleError(e);
                            pushStock(stock);
                        }
                }); 
        });
}

const getStockHandler = (socket)=>{

   _.each(stocks_names,(n)=>{
        redisClient.lrange(n,0,0,(err,data)=>{
            if (err) {
                return handleError(err);
            }
            //verify changes on data stock
            try{
                let data_json=JSON.parse(data);
                redisClient.publish(n,data_json.l); 
            } catch(e){
                handleError(e);
            }
        });
    })
             
   
    setInterval(()=>{
        requireStock(compareStock);
    },1000);
}

const init = (listener,callback)=>{
    redisClient.on('ready',()=>{
        redisSub.on('ready',()=>{
            _.each(stocks_names,(n)=>{
                redisSub.subscribe(n);
            })
            io = SocketIO.listen(listener);
            io.on('connection', getStockHandler);
            redisSub.on('message', function (channel, message) {
                //console.log(channel + ' : ' + message);
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
