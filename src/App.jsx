import {useEffect, useState, useCallback} from 'react'
import './App.css'
import useWebSocket, { ReadyState } from 'react-use-websocket';
import Browser from "./Browser.jsx";

//connect to server socket
let _socket = null;
_socket = await getSocket();
function getSocket() {
  return new Promise(function(resolve, reject) {
    // Check if websocket is already open
    // if yes, return the socket wrapped into a Promise
    if (_socket && _socket.readyState === 1) {
      return resolve(_socket);
    }

    let socket = new WebSocket('ws://localhost:3333')
    socket.onopen = () => {
      console.log('connected')
      _socket = socket;
      return resolve(socket);
    }
    socket.onmessage = (event) => {
      console.log('onmessage')
    }
    socket.onclose = () => {
      console.log('disconnected')
    }
  });
}



function App() {

  const [socketUrl, setSocketUrl] = useState('ws://localhost:3333');
  const [messageHistory, setMessageHistory] = useState([]);
  const { sendMessage, lastMessage, readyState }
    = useWebSocket(socketUrl);
  const [images, setImages] = useState([])


  //get images from server and set state
  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data)
      if (data.what === 'images') setImages(data.images)
      setMessageHistory((prev) => prev.concat(lastMessage));
    }
  }, [lastMessage, setMessageHistory]);

  const handleClickSendMessage = useCallback(() => sendMessage(
    JSON.stringify({what: "images"})), [sendMessage]
  );


  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return (
    <>
      <h1>Cozy Nest Image Browser</h1>
      <span>The WebSocket is currently {connectionStatus}</span>
      <button
        onClick={handleClickSendMessage}
        disabled={readyState !== ReadyState.OPEN}
      >Load</button>
      <Browser key={0} imagesRef={images}/>
    </>
  )
}

export default App
