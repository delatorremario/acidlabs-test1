'use strict';
const _ = require('lodash');
const redisClient = require('redis-connection')();
const redisSub = require('redis-connection')('subscriber');
const request = require('request');
//const handleError = require('hapi-error').handleError;

const SocketIO = require('socket.io');
let io;

const stocks_names =   ['AAPL','ABC','MSFT','TSLA','F'];

const pushStock = (stock) => {
    console.log('save changes',stock.t,stock.l);
    _.extend(stock,{timestamp: new Date()});
    redisClient.lpush(stock.t,JSON.stringify(stock));
    redisClient.publish(stock.t,JSON.stringify(stock)); 
    redisClient.publish('error',JSON.stringify({show:false})); //clear message 
} 

const requireStock = (callback)=>{
        //service without notifications 
       
            request.get('http://finance.google.com/finance/info?client=ig&q=AAPL,ABC,MSFT,TSLA,F', (err, res, content) => {
                try{
                    //if (Math.random(0, 1) < 0.1) throw new Error('How unfortunate! The API Request Failed')
                    if (err) {
                        handleError('Can not access to Google finance', 'The API Request Failed. Showing the last update');
                        return
                    }
                    switch(res.statusCode) {
                        case 200:
                            let new_content = content.replace('// ','');
                            let stocks = JSON.parse(new_content);
                            return callback(stocks); 
                        case 404: 
                        return handleError('Can not to access Google finance', 'Error 404 not found. Showing the last update');
                        default:
                        return handleError('Can not to access Google finance', 'Error 500. Showing the last update'); 
                    }
                }catch(e){
                    console.log('error',e);
                    handleError('How unfortunate! The API Request Failed','');
                }
            });
        
        
}

const compareStock = (stocks)=>{
        //console.log(stocks);
        
        _.each(stocks,function(stock){
                   redisClient.lrange(stock.t,0,0,(err,data)=>{
                        if (err) {
                            redisClient.del(stock.t);
                            return console.log(err);
                        }
                        //verify changes on data stock
                        try{
                            let data_json=JSON.parse(data);
                            if(stock.l!=data_json.l) pushStock(stock); //save changes in redis
                        } catch(e){
                            console.log(e);
                            pushStock(stock);
                        }
                }); 
        });
}

const getStockHandler = (socket)=>{

    //show last data saved
   _.each(stocks_names,(stock_name)=>{ 
        redisClient.lrange(stock_name,0,0,(err,stock)=>{
            console.log('stock',stock_name,JSON.parse(stock));
            if (err) {
                return console.log(err);
            }
            //verify changes on data stock
            try{
               redisClient.publish(stock_name,stock); 
            } catch(e){
                console.log(e);
            }
        });
    })
             
   
    setInterval(()=>{
        requireStock(compareStock);
    },1000);
}
const handleError=(title,message) => redisClient.publish('error',JSON.stringify({title:title,message:message,show:true}));


const init = (listener,callback)=>{
    redisClient.on('ready',()=>{
        redisSub.on('ready',()=>{
            //subscribe to errors
            redisSub.subscribe('error');

            _.each(stocks_names,(n)=>{
                redisSub.subscribe(n);
            })
            io = SocketIO.listen(listener);
            io.on('connection', getStockHandler);
            redisSub.on('message',  (channel, message) => {
                //console.log(channel + ' : ' + message);
               io.emit(channel, JSON.parse(message)); // relay to all connected socket.io clients
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
