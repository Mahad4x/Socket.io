import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';

const port = 3001;
const app = express();
const server = http.createServer(app);

const users= new Map();
// Set up CORS options
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
};
app.use(cors(corsOptions));

// Set up Socket.io
const io = new Server(server, {
  cors: corsOptions,  
});

app.get('/', (req, res) => {
  res.send('hello');
});

io.on('connection', (socket) => {
  
  console.log('A user connected');

  socket.on('Username', (username)=>{
    users.set(username,socket.id);
    socket.username = username;
    let usernamesArray = Array.from(users.keys());

    console.log(users.keys());
    console.log(` ${socket.username} has a key of ${users.get(username)}`);
    socket.emit('list', usernamesArray);
  })
  socket.on('chatMessage',(data)=>{
    const{username,message,receiver}=data;
    const receiverSocketId = users.get(receiver);
    console.log(`${username} sended ${message} to ${receiver}`)
    if(receiverSocketId){
    io.to(receiverSocketId).emit('message' , { username , message })
    }
    
    socket.emit('message', { username, message });

    
  })

  socket.on('JoinRoom', (data) => {
    const { RoomName, username, message } = data;
    console.log('JoinRoom event received:', RoomName, username, message); // Log here
    if (RoomName) {
      socket.join(RoomName);
      console.log(`${socket.username} has joined the room ${RoomName}`);
    } else {
      console.log('Invalid room name');
    }
    io.to(RoomName).emit('JoinRoom', { username, message });
  })
  
  // You can set up more event handlers here
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
})

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
