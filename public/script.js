var socket = io();

function setUsername() {
    socket.emit('setUsername', document.getElementById('name').value);
}

var user;
var messages = [];
var currDialog;

socket.on('userExists', function(data) {
    document.getElementById('error-container').innerHTML = data;
});

socket.on('userSet', function(data) {
    user = data.username;

    var usersHTML = '';


    for(var i = 0; i < data.users.length; i++){
        if(data.users[i] !== user){
            usersHTML = usersHTML + (`<div class="member"><div class="member" onclick="openDialog('` + data.users[i] + `'); return false;">` + data.users[i] + `</div></div>`);
        }
    }

    document.body.innerHTML = `<div class="members">` +
        `<div class="title">Пользователи онлайн</div>` +
        usersHTML +
        `</div>` +
        `<div class="messages"></div>`;
});

socket.on('newclient', function (data) {
    var el = document.createElement('div');
    el.classList.add('member');
    el.innerHTML = `<div class="member" onclick="openDialog('` + data.username + `'); return false;">` + data.username + `</div>`;
    document.querySelector('.members').appendChild(el);
});

function sendMessage(name) {
    var msg = document.getElementById('message').value;

    document.getElementById('message').value = '';

    var di = document.createElement('div');
    di.classList.add('outcome');
    di.innerHTML = `<div class="name">` + user + `</div>` +
        `<div class="text">` + msg + `</div>`;

    document.querySelector('.messages').appendChild(di);

    if(msg) {
        messages.push({message: msg, from: user, to: name});
        socket.emit('msg', {message: msg, from: user, to: name});
    }
}

socket.on('newmsg', function(data) {
    if(user) {
        messages.push(data);
        if(data.from === currDialog){
            var di = document.createElement('div');
            di.classList.add('incoming');
            di.innerHTML = `<div class="name">` + data.from + `</div>` +
                `<div class="text">` + data.message + `</div>`;

            document.querySelector('.messages').appendChild(di);

        }else{
            document.querySelectorAll('.member .member').forEach(function (el) {
                if(el.innerHTML === data.from){
                    var counter = el.parentElement.querySelector('.counter');
                    if(counter === null){
                        var counterDiv = document.createElement('div');
                        counterDiv.classList.add('counter');
                        counterDiv.innerHTML = '1';
                        el.parentElement.appendChild(counterDiv);
                    } else{
                        counter.innerHTML = parseInt(counter.innerHTML) + 1;
                    }
                }
            });
        }
    }
});

function openDialog(name) {
    var dialog = document.createElement('div');
    dialog.classList.add('control-dialog');
    dialog.innerHTML = `
        <input type = "text" id = "message">
         <button type = "button" name = "button" onclick = "sendMessage('` + name +`')">
            Отправить
         </button>
        `;

    document.querySelector('.messages').innerHTML = '';
    document.querySelector('.messages').appendChild(dialog);

    currDialog = name;

    document.querySelectorAll('.member .member').forEach(function (el) {
        if(el.innerHTML === name && el.parentElement.querySelector('.counter')){
            el.parentElement.querySelector('.counter').remove();
        }
    });

    for(var i = 0; i < messages.length; i++){
        if(messages[i].from === name){
            var di = document.createElement('div');
            di.classList.add('incoming');
            di.innerHTML = `<div class="name">` + messages[i].from + `</div>` +
                `<div class="text">` + messages[i].message + `</div>`;

            document.querySelector('.messages').appendChild(di);
        } else if(messages[i].from === user && messages[i].to === name){
            var di = document.createElement('div');
            di.classList.add('outcome');
            di.innerHTML = `<div class="name">` + user + `</div>` +
                `<div class="text">` + messages[i].message + `</div>`;

            document.querySelector('.messages').appendChild(di);
        }
    }
}