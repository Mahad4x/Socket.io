import React, { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';

const App = () => {
  const socket = useMemo(() => io('http://localhost:3001'), []);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [receiver,Setreceiver] = useState('');
const [RoomName,setRoomName] = useState('');
  const handleSendMessage = () => {
    
    socket.emit('chatMessage', { username, message, receiver});
    setMessage('');
  
};
 const handleRoomName = (e)=>{
  e.preventDefault();
  console.log(RoomName);
  socket.emit('JoinRoom',{RoomName,username,message});
  setMessage('');
 }

  useEffect(() => {
    const name = prompt('Please enter your name:');
    if (name) {
      setUsername(name);

      socket.emit('Username', name);

    }

    socket.on('connect', () => {
      console.log('Connected to the server');
      console.log('Socket ID:', socket.id);
    });

    socket.on('list', (data) => {
      console.log('Received list:', data);
    });

    socket.on('message', (data) => {
      console.log('Received message:', data);
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on('JoinRoom', (data) => {
      console.log('Received RoomName:', data);
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    

    return () => {
      socket.disconnect();
    };
  }, [socket]);


  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="w-full bg-gray-800 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-400">Chat App</h1>
          <p className="text-gray-400">Logged in as: <span className="text-white">{username}</span></p>
        </div>
      </nav>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="h-full bg-gray-800 shadow-lg rounded-lg p-4 overflow-y-scroll">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-3 p-3 rounded-lg max-w-[70%] ${
                
                msg.username === username
                  ? 'bg-green-600 text-white self-end ml-auto text-right'
                  : 'bg-gray-700 text-left'
              }`}
              style={{ alignSelf: msg.username === username ? 'flex-end' : 'flex-start' }}
            >
              <strong className="text-green-300">{msg.username}</strong>
              <p>{msg.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center rounded-lg bg-gray-900">
          <form onSubmit={handleRoomName}>
          <input
            type="text"
            className="flex-grow p-3 bg-gray-700 text-white rounded-l-lg focus:outline-none placeholder-gray-400"
            placeholder="Join a Room..."
            value={RoomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <button
            type='submit'
            className="p-3 bg-green-500 text-white rounded-r-lg hover:bg-green-600"
          ></button>
          </form>
          <input
            type="text"
            className="flex-grow p-3 bg-gray-700 text-white rounded-l-lg focus:outline-none placeholder-gray-400"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <input
            type="text"
            className="flex-grow p-3 bg-gray-700 text-white rounded-l-lg focus:outline-none placeholder-gray-400"
            placeholder="Type Receiver Name..."
            value={receiver}
            onChange={(e) => Setreceiver(e.target.value)}
          />
          <button
            onClick={handleSendMessage}
            className="p-3 bg-green-500 text-white rounded-r-lg hover:bg-green-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
