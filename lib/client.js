'use strict';

$(document).ready(()=>{
   const socket = io(); //initialise socket.io
  
   const renderMessage = (message) => {
        let html = '<h4>';

        html += message;
        html += html += '</h4>';
        $('#messages').html(html);  // append to list
   }

   socket.on('stock',(msg)=>{
        renderMessage(msg);
   });

});