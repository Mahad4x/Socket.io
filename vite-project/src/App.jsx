import React, { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import NotificationSystem from './NotificationSystem';

const App = () => {
  const socket = useMemo(() => io('http://localhost:3001'), []);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState('');
  const [roomName, setRoomName] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);

  const handleSendMessage = () => {
    if (message.trim()) {
      socket.emit('chatMessage', { username, message, receiver });
      setMessage('');
    }
  };

  const handleRoomName = (e) => {
    e.preventDefault();
    if (roomName.trim()) {
      socket.emit('JoinRoom', { RoomName: roomName, username, message });
      setMessage('');
    }
  };

  useEffect(() => {
    const name = prompt('Please enter your name:');
    if (name) {
      setUsername(name);
      socket.emit('Username', name);
    }

    socket.on('connect', () => {
      console.log('Connected to the server');
    });

    socket.on('list', (data) => {
      setOnlineUsers(data);
    });

    socket.on('message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on('JoinRoom', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <nav className="w-full bg-gray-800 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-400">Chat App</h1>
          <div className="flex items-center space-x-4">
            <NotificationSystem socket={socket} username={username} />
            <p className="text-gray-400">Logged in as: <span className="text-white">{username}</span></p>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-gray-800 p-4 border-r border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Online Users</h2>
          <ul className="space-y-2">
            {onlineUsers.map((user, index) => (
              <li
                key={index}
                className="cursor-pointer hover:bg-gray-700 p-2 rounded"
                onClick={() => setReceiver(user)}
              >
                {user} {user === username && '(you)'}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="h-full bg-gray-800 shadow-lg rounded-lg p-4 overflow-y-scroll">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-3 p-3 rounded-lg max-w-[70%] ${
                    msg.username === username
                      ? 'bg-green-600 text-white self-end ml-auto'
                      : 'bg-gray-700'
                  }`}
                >
                  <strong className="text-green-300">{msg.username}</strong>
                  <p>{msg.message}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gray-800 border-t border-gray-700">
            <form onSubmit={handleRoomName} className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  className="flex-grow p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Join a Room..."
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Join
                </button>
              </div>
            </form>

            <div className="flex space-x-2">
              <input
                type="text"
                className="flex-grow p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <input
                type="text"
                className="w-48 p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Receiver..."
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
              />
              <button
                onClick={handleSendMessage}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default App;