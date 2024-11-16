import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';

const port = 3001;
const app = express();
const server = http.createServer(app);

const users = new Map();
const pendingNotifications = new Map(); // Store notifications for offline users

const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
};

app.use(cors(corsOptions));

const io = new Server(server, {
  cors: corsOptions,
});

app.get('/', (req, res) => {
  res.send('hello');
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('Username', (username) => {
    users.set(username, socket.id);
    socket.username = username;
    let usernamesArray = Array.from(users.keys());
    
    // Send pending notifications if any exist for this user
    if (pendingNotifications.has(username)) {
      const notifications = pendingNotifications.get(username);
      notifications.forEach(notification => {
        socket.emit('notification', notification);
      });
      pendingNotifications.delete(username);
    }

    socket.emit('list', usernamesArray);
  });

  socket.on('chatMessage', (data) => {
    const { username, message, receiver } = data;
    const receiverSocketId = users.get(receiver);
    
    // Send message
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('message', { username, message });
      // Send notification to receiver
      io.to(receiverSocketId).emit('notification', {
        type: 'newMessage',
        from: username,
        message: `New message from ${username}`,
        timestamp: new Date(),
      });
    } else {
      // Store notification for offline user
      if (!pendingNotifications.has(receiver)) {
        pendingNotifications.set(receiver, []);
      }
      pendingNotifications.get(receiver).push({
        type: 'newMessage',
        from: username,
        message: `New message from ${username}`,
        timestamp: new Date(),
      });
    }
    
    socket.emit('message', { username, message });
  });

  socket.on('JoinRoom', (data) => {
    const { RoomName, username, message } = data;
    
    if (RoomName) {
      socket.join(RoomName);
      // Notify all users in the room about new member
      io.to(RoomName).emit('notification', {
        type: 'roomJoin',
        from: 'System',
        message: `${username} has joined ${RoomName}`,
        timestamp: new Date(),
      });
    }
    
    io.to(RoomName).emit('JoinRoom', { username, message });
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      users.delete(socket.username);
      // Notify other users about disconnection
      io.emit('notification', {
        type: 'userDisconnect',
        from: 'System',
        message: `${socket.username} has disconnected`,
        timestamp: new Date(),
      });
    }
    console.log('A user disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});