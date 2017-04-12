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
    redisClient.lrange(stock.t,0,10,(err,stocks) => {
            if (err) {
                return console.log(err);
            }
            let history_name = 'history_' + stock.t;
            redisClient.publish(history_name,JSON.stringify(stocks)); 
    });

    redisClient.publish(stock.t,JSON.stringify(stock)); 
    
    redisClient.publish('error',JSON.stringify({show:false})); //clear message 

    //open market
    redisClient.get('isopen',(err,isopen) => {

            if(isopen === 'false' || isopen === null){
                console.log('OPEN');
                redisClient.publish('open','true');
                redisClient.set('isopen',true);
                redisClient.expire('isopen',60);
            }
    })
} 

const requireStock = (callback)=>{
            //service without notifications 
            request.get('http://finance.google.com/finance/info?client=ig&q=AAPL,ABC,MSFT,TSLA,F', (err, res, content) => {
                try{
                    if (Math.random(0, 1) < 0.1) throw new Error('How unfortunate! The API Request Failed')
                    if (err) {
                        handleError('Can not access to Google finance', 'Showing the last update');
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
                    //console.log('How unfortunate! The API Request Failed');
                    handleError('How unfortunate! The API Request Failed','Showing the last update');
                }
            });

            //let new_content =[ { "id": "22144" ,"t" : "AAPL" ,"e" : "NASDAQ" ,"l" : "482.86" ,"l_fix" : "141.78" ,"l_cur" : "141.96" ,"s": "0" ,"ltt":"1:03PM EDT" ,"lt" : "Apr 11, 1:03PM EDT" ,"lt_dts" : "2017-04-11T13:03:53Z" ,"c" : "-1.21" ,"c_fix" : "-1.21" ,"cp" : "-0.85" ,"cp_fix" : "-0.85" ,"ccol" : "chr" ,"pcls_fix" : "143.17" } ,{ "id": "658010" ,"t" : "ABC" ,"e" : "NYSE" ,"l" : "87.30" ,"l_fix" : "87.30" ,"l_cur" : "87.30" ,"s": "0" ,"ltt":"1:02PM EDT" ,"lt" : "Apr 11, 1:02PM EDT" ,"lt_dts" : "2017-04-11T13:02:32Z" ,"c" : "-1.14" ,"c_fix" : "-1.14" ,"cp" : "-1.29" ,"cp_fix" : "-1.29" ,"ccol" : "chr" ,"pcls_fix" : "88.44" } ,{ "id": "358464" ,"t" : "MSFT" ,"e" : "NASDAQ" ,"l" : "65.53" ,"l_fix" : "65.53" ,"l_cur" : "65.53" ,"s": "0" ,"ltt":"1:03PM EDT" ,"lt" : "Apr 11, 1:03PM EDT" ,"lt_dts" : "2017-04-11T13:03:50Z" ,"c" : "0.00" ,"c_fix" : "0.00" ,"cp" : "0.00" ,"cp_fix" : "0.00" ,"ccol" : "chb" ,"pcls_fix" : "65.53" } ,{ "id": "12607212" ,"t" : "TSLA" ,"e" : "NASDAQ" ,"l" : "309.82" ,"l_fix" : "309.82" ,"l_cur" : "309.82" ,"s": "0" ,"ltt":"1:03PM EDT" ,"lt" : "Apr 11, 1:03PM EDT" ,"lt_dts" : "2017-04-11T13:03:52Z" ,"c" : "-2.57" ,"c_fix" : "-2.57" ,"cp" : "-0.82" ,"cp_fix" : "-0.82" ,"ccol" : "chr" ,"pcls_fix" : "312.39" } ,{ "id": "13606" ,"t" : "F" ,"e" : "NYSE" ,"l" : "11.24" ,"l_fix" : "11.24" ,"l_cur" : "11.24" ,"s": "0" ,"ltt":"1:03PM EDT" ,"lt" : "Apr 11, 1:03PM EDT" ,"lt_dts" : "2017-04-11T13:03:34Z" ,"c" : "-0.01" ,"c_fix" : "-0.01" ,"cp" : "-0.04" ,"cp_fix" : "-0.04" ,"ccol" : "chr" ,"pcls_fix" : "11.25" } ]
            //return callback(new_content);
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

const getStockHandler = (socket) => {

    redisClient.get('isopen',(err,isopen) => {
        if(isopen===true) redisClient.publish('open','true')
        else     redisClient.publish('open','false')
    })

    //show last data saved
   _.each(stocks_names,(stock_name) => { 
       //publish last update
        redisClient.lrange(stock_name,0,0,(err,stock) => {
            if (err) {
                return console.log(err);
            }
            if(stock.length!=0) redisClient.publish(stock_name,stock); 
        });
  
        //publish list last 10 updates
         redisClient.lrange(stock_name,0,10,(err,stocks) => {
            if (err) {
                return console.log(err);
            }
            let history_name = 'history_' + stock_name;
            if(stocks.length!=0) redisClient.publish(history_name,JSON.stringify(stocks)); 
        });
    })

    setInterval(()=>{
        redisClient.get('isopen',(err,isopen) => {
            if(isopen === null){
                console.log('EXPIRE');
                redisClient.publish('open','false');
                redisClient.set('isopen',false);
            }
        })
        requireStock(compareStock);
    },1000);
}
const handleError=(title,message) => redisClient.publish('error',JSON.stringify({title:title,message:message,show:true}));

const init = (listener,callback)=>{
    redisClient.on('ready',()=>{
        redisSub.on('ready',()=>{
            
            //subscribe to errors
            redisSub.subscribe('error');

            //subscribe to open marketOpen
            redisSub.subscribe('open');
           
            _.each(stocks_names,(name)=>{
                redisSub.subscribe(name);
                 let history_name = 'history_' + name;
                 redisSub.subscribe(history_name);
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
