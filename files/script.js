const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

//JOin chatroom
socket.emit('joinRoom', { username, room });


//Get users and room
// socket.on('roomUsers', ({ room, users }) => {
//     outputRoomName(room);
//     outputUsers(users);
// });

socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);

    // Find the user object for the current user
    const user = users.find(u => u.username === username);

    // Save the user object in a variable for later use
    currentUser = user;
});


socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const msg = e.target.elements.msg.value;

    socket.emit('chatMessage', msg);

    e.target.elements.msg.value = ''
});

// function outputMessage(message) {
//     const div = document.createElement('div');
//     div.classList.add('message');
//     div.innerHTML = `
//     <p class="meta">${message.username}<span>${message.time}</span></p>
//     <p>${message.text}</p>`
//     document.querySelector('.chat-messages').appendChild(div);
// }

function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');

    const messageBody = document.createElement('div');
    messageBody.classList.add('message-body');

    if (message.username === username) {
        messageBody.classList.add('outgoing');
    } else {
        messageBody.classList.add('incoming');
    }

    messageBody.innerHTML = `
        <p class="meta">${message.username}<span>${message.time}</span></p>
        <p>${message.text}</p>
    `;
    div.appendChild(messageBody);

    chatMessages.appendChild(div);
}


//Add room Name 
function outputRoomName(room) {
    roomName.innerText = room;
}

//Add users
function outputUsers(users) {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}

