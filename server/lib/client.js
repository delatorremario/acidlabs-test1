'use strict';

$(document).ready(()=>{
   const socket = io(); //initialise socket.io
  
   const renderStock = (key,stock) => {
        $('#'+key).html(stock); 
   }

   socket.on('AAPL',(msg)=>{
        renderStock('AAPL',msg);
   });
    socket.on('ABC',(msg)=>{
        renderStock('ABC',msg);
   });
    socket.on('MSFT',(msg)=>{
        renderStock('MSFT',msg);
   });
    socket.on('TSLA',(msg)=>{
        renderStock('TSLA',msg);
   });
    socket.on('F',(msg)=>{
        renderStock('F',msg);
   });
});