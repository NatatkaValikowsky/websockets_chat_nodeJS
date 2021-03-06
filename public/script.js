var socket = io();

function setUsername() {
    if(document.querySelector('#name').value === ''){
        document.getElementById('error-container').innerHTML = 'Введите имя';
        document.getElementById('error-container').style.display = 'block';

        setTimeout(function () {
            document.getElementById('error-container').style.display = 'none';
        }, 3000);

        return;
    }
    socket.emit('setUsername', document.getElementById('name').value);
}

var user;
var messages = [];
var currDialog;

socket.on('userExists', function(data) {
    document.getElementById('error-container').innerHTML = data;
    document.getElementById('error-container').style.display = 'block';

    setTimeout(function () {
        document.getElementById('error-container').style.display = 'none';
    }, 3000);
});

socket.on('userSet', function(data) {
    user = data.username;

    var usersHTML = '';


    for(var i = 0; i < data.users.length; i++){
        if(data.users[i] !== user){
            usersHTML = usersHTML + (`<div class="member"><div class="member" onclick="openDialog('` + data.users[i] + `'); return false;">` + data.users[i] + `</div></div>`);
        }
    }

    document.body.innerHTML = `<div class="chat dialogs-block"><div class="members">` +
        `<div class="title">Пользователей онлайн: <span id="usersCount">`+ (data.users.length - 1) +`</span></div>` +
        usersHTML +
        `</div>` +
        `<div class="messages"></div></div>`;
});

socket.on('newclient', function (data) {
    var el = document.createElement('div');
    el.classList.add('member');
    el.addEventListener('click', function () {
        openDialog(data.username);
    });
    el.innerHTML = `<div class="member">` + data.username + `</div>`;
    document.querySelector('.members').appendChild(el);
    document.querySelector('#usersCount').innerHTML = data.users.length - 1;
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

socket.on('dis', function(data) {

    users = document.querySelectorAll('.members > .member');

    users.forEach(function (el) {
       if(el.querySelector('.member').innerHTML === data.username){
           el.remove();
       }
    });
});

function openDialog(name) {
    var dialog = document.createElement('div');
    dialog.classList.add('control-dialog');
    dialog.innerHTML = `
        <input type = "text" id = "message" placeholder="Введите сообщение">
         <button type = "button" name = "button" onclick = "sendMessage('` + name +`')">
            <i class="fa fa-paper-plane" aria-hidden="true"></i>
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