
'use strict';

const Hapi = require('hapi');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({ 
    host: 'localhost', 
    port: 8000 
});

// Add the API route
/*server.route({
    method: 'GET',
    path:'/name/{name}', 
    handler: function (request, reply) {
        reply('Hello, ' + encodeURIComponent(request.params.name) + '!');
    }
});
*/

//Statics Pages
server.register([require('inert'), require('hapi-error')], (err) => {

    server.route([
            {method: 'GET',path: '/',handler: {file:'index.html'}},
            {method: 'GET',path: '/client.js',handler: {file:'./lib/client.js'}},
        ]);

    // Start the server
    server.start(() => {
        require('./lib/get_stock').init(server.listener,()=>{
            console.log('Server running at:',server.info.uri);
        });
        
    });

});

module.exports = server;

