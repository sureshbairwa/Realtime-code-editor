import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors(
    {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true
    }
));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true

    }
}); 

let rooms = {};
let users = {};
let code = {};
let groupChat= {}

app.get('/', (req, res) => {
    res.send('server is running');
})


io.on('connection', (socket) => {
    console.log('a user connected',socket.id);


    

    socket.on('join_room', ({roomId,username}) => {
        console.log('roomId:', roomId, 'username:', username);

        if(rooms[roomId]){
            rooms[roomId].push({socketId:socket.id, username});
        }else{
            rooms[roomId] = [{socketId:socket.id, username}];
            code[roomId] = '';
            groupChat[roomId]=[]
        }
        
        users[socket.id] = username;
        socket.join(roomId);
        socket.emit('code_synch', {value: code[roomId]});
        socket.emit('group_chat',groupChat[roomId])
        socket.to(roomId).emit("message", `${username} joined the room`);
        io.to(roomId).emit('users', rooms[roomId]);
        socket.room = roomId;
       
        console.log(rooms[roomId]);
       

    });

    socket.on('code_change', ({roomId, value}) => {
        code[roomId] = value;
        socket.to(roomId).emit('code_synch', {value});
    });

    socket.on('new_message', ({roomId, message}) => {
        console.log('message:', message);
        if(!groupChat[roomId]){
            groupChat[roomId]=[]
        }
        groupChat[roomId].push({message,username:users[socket.id]})
        io.to(roomId).emit('group_chat',groupChat[roomId])
        console.log("group chat",groupChat[roomId])
    });

    socket.on('disconnect', () => {

        if(!socket.room
            || !rooms[socket.room]
            || !rooms[socket.room].find(user => user.socketId === socket.id)){
            return;
        }
       
        rooms[socket.room] = rooms[socket.room].filter(user => user.socketId !== socket.id);
        console.log(rooms[socket.room]);
        io.to(socket.room).emit('users', rooms[socket.room]);
        
        socket.broadcast.to(socket.room).emit("message", `${users[socket.id]} left the room`);
        delete users[socket.id];

    
        delete users[socket.id];
        console.log('user disconnected');
    });
   
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log('listening on http://localhost:3000');
});
