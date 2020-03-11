var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

users = [];
sockets = [];
io.on('connection', function(socket) {
    console.log('A user connected');
    socket.on('setUsername', function(data) {
        console.log(data);

        if(users.indexOf(data) > -1) {
            socket.emit('userExists', data + ' username is taken! Try some other username.');
        } else {
            users.push(data);
            sockets.push({
                name: data,
                socket: socket
            });
            socket.emit('userSet', {username: data, users: users});
            socket.broadcast.emit('newclient', {username: data});
        }
    });

    socket.on('msg', function(data) {
        //Send message to everyone

        for(var i = 0; i < sockets.length; i++){
            if(sockets[i].name === data.to){
                sockets[i].socket.emit('newmsg', data);
                break;
            }
        }
    })
});

http.listen(3000, function() {
    console.log('listening on localhost:3000');
});