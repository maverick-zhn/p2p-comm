/* In God we trust
* Signaling Server with socket.io
* Made by: Servio Palacios
* Date: 2015.08.05
*/

var port = 8181;
var static = require('node-static');
var http = require('http');
// Create a node-static server instance
var file = new(static.Server)();

// We use the http modules createServer function and
// rely on our instance of node-static to serve the files
var app = http.createServer(function (req, res) {
  file.serve(req, res);
}).listen(port);

// Use socket.io JavaScript library for real-time web applications
// TODO
// Use SocketCLuster
var io = require('socket.io').listen(app);
var globalChannel = "";

console.log("Listening on port: [" + port + "]");

// Managing connections on the socket ...
io.sockets.on('connection', function (socket){

    	  // On received message
        socket.on('message', function (message) {
                log('S --> got message: ', message);
								console.log("Got Message : " + message + " channel " + globalChannel);
                // channel-only broadcast...
                socket.broadcast.to(globalChannel).emit('message', message);
        });

        // Handle 'create or join' messages
        socket.on('create or join', function (room) {

					    var namespace = '/';
              var roomName = room;
							var counter = 0;
							for (var socketId in io.nsps[namespace].adapter.rooms[roomName]) {
									console.log(socketId);
									counter++;
							}
							console.log("Counter: " + counter);
							var numClients = counter;

                console.log('numclients = ' + numClients);

                log('Signaling Server --> Room ' + room + ' has ' + numClients + ' client(s)');
                log('Signaling Server --> Request to create or join room', room);
								globalChannel = room;

                // First client joining ...
                if (numClients == 0){
                  socket.join(room);
                  console.log("Room created [" + room + "]");
                  socket.emit('created', room);
                } else if (numClients == 1) {
                  // Second client joining...
                  io.sockets.in(room).emit('join', room);
                  socket.join(room);
                  console.log("[Joined]");
                  socket.emit('joined', room);
                } else { // max two clients
                  socket.emit('full', room);
                }
        });

        function log(){
            var array = [">>> "];
            for (var i = 0; i < arguments.length; i++) {
            	array.push(arguments[i]);
            }
            socket.emit('log', array);
        }
});
