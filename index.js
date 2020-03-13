var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + "/public"));

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
            socket.broadcast.emit('newclient', {username: data, users: users});

            socket.name = data;
        }
    });

    socket.on('disconnect', function () {


        users.forEach(function(item, index, object) {
            if (item === socket.name) {
                object.splice(index, 1);
            }
        });

        console.log(users);

        socket.broadcast.emit('dis', {username: socket.name});
    });

    socket.on('msg', function(data) {

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