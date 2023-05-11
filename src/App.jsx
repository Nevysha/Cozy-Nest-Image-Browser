import {useEffect, useState, useCallback} from 'react'
import './App.css'
import useWebSocket, { ReadyState } from 'react-use-websocket';
import Browser from "./Browser.jsx";

//for dev purpose
let _DEV = false;
(function() {
  // if url is http://localhost:5173/file=extensions/Cozy-Nest/cozy-nest-image-browser
  if (window.location.href.includes('file=extensions/Cozy-Nest/cozy-nest-image-browser')) {
    _DEV = true;

    //inject css
    document.querySelector('body').setAttribute("style", "height: 100vh; overflow: hidden;")

    //inject css link to gradio
    const linkGradioCss = document.createElement('link');
    linkGradioCss.rel = 'stylesheet';
    linkGradioCss.type = 'text/css';
    linkGradioCss.href = 'http://127.0.0.1:7860/theme.css'
    document.head.appendChild(linkGradioCss);

    //inject css link to Cozy-Nest
    const linkCozyNestCss = document.createElement('link');
    linkCozyNestCss.rel = 'stylesheet';
    linkCozyNestCss.type = 'text/css';
    linkCozyNestCss.href = 'http://127.0.0.1:7860/file=extensions/Cozy-Nest/style.css';
    document.head.appendChild(linkCozyNestCss);

  }
})()

//connect to server socket
let _socket = null;
(async () => _socket = await getSocket())();
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

//component to wrap flex row
function Row(props) {
  return <div className="flex-row">
    {props.children}
  </div>
}

//component to wrap flex column
function Column(props) {
  return <div className="flex-column">
    {props.children}
  </div>
}



function App() {

  const [socketUrl, setSocketUrl] = useState('ws://localhost:3333');
  const [messageHistory, setMessageHistory] = useState([]);
  const { sendMessage, lastMessage, readyState }
    = useWebSocket(socketUrl);
  const [images, setImages] = useState([])
  const [filteredImages, setFilteredImages] = useState([])
  const [searchStr, setSearchStr] = useState('');

  const handleClickSendMessage = useCallback(() => sendMessage(
    JSON.stringify({what: "images"})), [sendMessage]
  );

  //get images from server and set state
  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data)
      if (data.what === 'images') setImages(data.images)
      setMessageHistory((prev) => prev.concat(lastMessage));
    }
  }, [lastMessage, setMessageHistory]);

  //if images is empty, load images
  useEffect(() => {
    if (images.length === 0) {
      handleClickSendMessage()
    }
    else {
      setFilteredImages(images)
    }
  }, [images, handleClickSendMessage])

  //if searchStr is not empty, filter images
  useEffect(() => {
    if (searchStr !== '') {
      const filteredImages = images.filter(image => {
        if (image.metadata.exif.parameters.includes(searchStr)) {
          console.log(`path: ${image.path}`)
          return true;
        }
        else return false;
      })
      setFilteredImages(filteredImages)
    }
    else {
      setFilteredImages(images)
    }
  }, [searchStr])

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return (
    <>
      <Column>
        <h1>Cozy Nest Image Browser</h1>
        <Row>
          <span>The WebSocket is currently {connectionStatus}</span>
          <button
            className="nevysha lg primary gradio-button btn"
            onClick={handleClickSendMessage}
            disabled={readyState === ReadyState.OPEN}
          >
            Start
          </button>
        </Row>

        <textarea data-testid="textbox"
                  placeholder=""
                  rows="1"
                  spellCheck="false"
                  data-gramm="false"
                  onChange={(e) => setSearchStr(e.target.value)}/>


      </Column>
      <Browser key={0} imagesRef={filteredImages}/>
    </>
  )
}

export default App
