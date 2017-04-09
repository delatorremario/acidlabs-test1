'use strict';
//const pub = require('redis-connection')();
//const sub = require('redis-connection')('subscriber');
const request = require('request');
const handleError = require('hapi-error').handleError;

const SocketIO = require('socket.io');
let io;

const getStockInterval= (reply)=>{
     setInterval(()=>{
        //get info from API: http://finance.google.com/finance/info?client=ig&q=AAPL,ABC,MSFT,TSLA,F
        request.get('http://finance.google.com/finance/info?client=ig&q=AAPL,ABC,MSFT,TSLA,F', function(err, res, content) {
                if (err) {
                    return reply(handleError(err));
                }
                switch(res.statusCode) {
                    case 200:
                        let new_content = content.replace('// ','')
                        return reply(JSON.parse(new_content));
                    case 404: 
                        return reply(handleError('404 not found'));
                    default:
                        return reply(handleError('error 500'));  
                }
        });
            
    },1000);
}
const callbackGetStock = (req)=>{

        //get last data saved
        //exists changs save in redis
        if(req[0].l != last_update[0].l) console.log('CHANGES DETECTS');

}

const getStockHandler = (socket)=>{
    let count = 0;
    setInterval(()=>{
        count++;
        console.log(count);
        socket.emit('stock','Hola!' + count);
    },1000)
        
}

const init = (listener,callback)=>{
    //get stock info at interval time
    //getStockInterval(callbackGetStock);
     // setup redis pub/sub independently of any socket.io connections
      // now start the socket.io
      console.log('init');
      io = SocketIO.listen(listener);
      io.on('connection', getStockHandler);
     
      return setTimeout(function () {
        return callback();
      }, 300); // wait for socket to boot
}
module.exports = {
    init:init
}


let last_update=[ { id: '22144',
    t: 'AAPL',
    e: 'NASDAQ',
    l: '143.34',
    l_fix: '143.34',
    l_cur: '143.34',
    s: '0',
    ltt: '4:00PM EDT',
    lt: 'Apr 7, 4:00PM EDT',
    lt_dts: '2017-04-07T16:00:02Z',
    c: '-0.32',
    c_fix: '-0.32',
    cp: '-0.22',
    cp_fix: '-0.22',
    ccol: 'chr',
    pcls_fix: '143.66' },
  { id: '658010',
    t: 'ABC',
    e: 'NYSE',
    l: '87.62',
    l_fix: '87.62',
    l_cur: '87.62',
    s: '0',
    ltt: '4:00PM EDT',
    lt: 'Apr 7, 4:00PM EDT',
    lt_dts: '2017-04-07T16:00:50Z',
    c: '-0.02',
    c_fix: '-0.02',
    cp: '-0.02',
    cp_fix: '-0.02',
    ccol: 'chr',
    pcls_fix: '87.64' },
  { id: '358464',
    t: 'MSFT',
    e: 'NASDAQ',
    l: '65.68',
    l_fix: '65.68',
    l_cur: '65.68',
    s: '0',
    ltt: '4:00PM EDT',
    lt: 'Apr 7, 4:00PM EDT',
    lt_dts: '2017-04-07T16:00:02Z',
    c: '-0.05',
    c_fix: '-0.05',
    cp: '-0.08',
    cp_fix: '-0.08',
    ccol: 'chr',
    pcls_fix: '65.73' },
  { id: '12607212',
    t: 'TSLA',
    e: 'NASDAQ',
    l: '302.54',
    l_fix: '302.54',
    l_cur: '302.54',
    s: '0',
    ltt: '4:00PM EDT',
    lt: 'Apr 7, 4:00PM EDT',
    lt_dts: '2017-04-07T16:00:01Z',
    c: '+3.84',
    c_fix: '3.84',
    cp: '1.29',
    cp_fix: '1.29',
    ccol: 'chg',
    pcls_fix: '298.7' },
  { id: '13606',
    t: 'F',
    e: 'NYSE',
    l: '11.23',
    l_fix: '11.23',
    l_cur: '11.23',
    s: '0',
    ltt: '4:01PM EDT',
    lt: 'Apr 7, 4:01PM EDT',
    lt_dts: '2017-04-07T16:01:04Z',
    c: '-0.04',
    c_fix: '-0.04',
    cp: '-0.35',
    cp_fix: '-0.35',
    ccol: 'chr',
    pcls_fix: '11.27' } ]