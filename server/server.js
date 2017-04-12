
'use strict';

const Hapi = require('hapi');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({ 
    port:+process.env.PORT || 5000,
    routes: { cors: true }   
});

//Statics Pages
server.register([require('inert')], (err) => {

    // Start the server
    server.start(() => {
        require('./lib/get_stock').init(server.listener,()=>{
            console.log('Server running at:',server.info.uri);
        });
    });
});

module.exports = server;

