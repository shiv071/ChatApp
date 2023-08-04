const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
const http = require('http');
const hbs = require('hbs');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const botName = 'iChat bot';

const tempPath = path.join(__dirname, "files");
app.set("view engine", "hbs");
app.set("views", tempPath);
app.use(express.static(tempPath));

app.get("/", (req, res) => {
    res.render("index");
});


io.on('connection', (socket) => {

    socket.on('joinRoom', ({ username, room }) => {
        

        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        socket.emit('message', formatMessage(botName, 'Welcome to iChat '));

        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} joined the chat`));

        //Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} left the chat`));
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});

server.listen(port, () => {
    console.log("Listening on port ${port}");
})