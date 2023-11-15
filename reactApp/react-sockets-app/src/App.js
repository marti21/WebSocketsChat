import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import { ConnectionState } from './components/ConnectionState';
import { ConnectionManager } from './components/ConnectionManager';
import { Events } from "./components/Events";
import { Messages } from './components/Messages';
import { MyForm } from './components/MyForm';
import './App.css'

export default function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [fooEvents, setFooEvents] = useState([]);
  const [users, setUsers] = useState([])
  const [toUserId, setToUserId] = useState()
  const [toUserUsername, setToUserUsername] = useState()
  const [message, setMessage] = useState('')
  const [conversation, setConversation] = useState([])
  const [privateMessage, setPrivateMessage] = useState('')
  const [owner, setOwner] = useState(false)

  useEffect(() => {
    console.log("Después de setConversation EN EL HOOK:", conversation);
  }, [conversation]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onFooEvent(value) {
      setFooEvents(previous => [...previous, value]);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('foo', onFooEvent);

    socket.on('users', (users) => {
      setUsers(users); // Actualiza el estado de usuarios con la lista recibida del servidor.
    })

    socket.on("private message", ({ content, from, username }) => {
      console.log(content);
      console.log(from);

      const newMessage = `<strong>${username}:</strong> ${content}`;

      setOwner(false);
      setPrivateMessage(newMessage)
    })

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('foo', onFooEvent);
    };
  }, []);


  function selectedUser(userId, username) {
    setToUserId(userId);
    setToUserUsername(username)
    console.log(userId);
    console.log(username);
  }

  function sendPrivateMessage(){
    socket.emit("private message", {
      content: message,
      to: toUserId,
      username: 'Marti'
    });

    const newMessage = `<strong>Marti:</strong> ${message}`;
    setPrivateMessage(newMessage);
    setOwner(true);
  }

  return (
    <div className="App">
      {/*<Events events={fooEvents} />*/}
      {/*<ConnectionManager />*/}
      {/*<MyForm />*/}
      <div className='userContent'>
        <ConnectionState isConnected={isConnected} />
        <div className='personalStatsContent'>
          <span>Yo soy: {socket.id}</span>
          <span>Usuarios Conectados</span>
        </div>
        
        <div className='userList'>
          {users.map((user) => (
            socket.id != user.userID &&
              <div key={user.userID} className='userList'>
                <button className='userButton' onClick={() => selectedUser(user.userID, user.username)}>{user.username}</button>
              </div>
          ))}
        </div>
      </div>
      
      { toUserId &&
        <div className='chatContent'>
          <div className='userChatContent'>
            <h1>{toUserUsername}</h1>
          </div> 
          
          <div className='chatMessagesContent'>
            <Messages messages={conversation} message={privateMessage} owner={owner}></Messages>
          </div>

          <div className='inputButtonContent'>
            <input placeholder='Mensaje' value={message} 
              onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    sendPrivateMessage(); 
                    setMessage('')}
                  }
                } 
                onChange={ e => setMessage(e.target.value) } />
            <button className='sendMessageButton' onClick={() => {sendPrivateMessage(); setMessage('')}}>ENVIAR</button>
          </div>
          
        </div>
      }
    </div>
  );
}