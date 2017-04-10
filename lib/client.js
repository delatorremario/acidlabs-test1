'use strict';

$(document).ready(()=>{
   const socket = io(); //initialise socket.io
  
   const renderMessage = (message) => {
       console.log('message',message);
        let html = '<h2>';

        html += message;
        html += '</h2>';
        $('#messages').html(html);  // append to list
   }

   socket.on('AAPL',(msg)=>{
        renderMessage(msg);
   });
    socket.on('ABC',(msg)=>{
        renderMessage(msg);
   });
    socket.on('MSFT',(msg)=>{
        renderMessage(msg);
   });
    socket.on('TSLA',(msg)=>{
        renderMessage(msg);
   });
    socket.on('F',(msg)=>{
        renderMessage(msg);
   });
});