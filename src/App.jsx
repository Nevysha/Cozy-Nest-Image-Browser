import {useEffect, useState, useCallback, useRef} from 'react'
import './App.css'
import useWebSocket, { ReadyState } from 'react-use-websocket';
import Browser from "./Browser.jsx";
import {MockImageBrowser} from "../MockImageBrowser.jsx";

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

//component to wrap flex row
export function Row(props) {
  return <div className="flex-row">
    {props.children}
  </div>
}

//component to wrap flex column
export function Column(props) {
  return <div className="flex-column">
    {props.children}
  </div>
}

const serverPort = (() => {
  try {
    return document.querySelector('#cnib_socket_server_port > label > textarea').value
  }
  catch (e) {
    console.warn('cnib_socket_server_port not found in main gradio app')
    return 3333;
  }

})();

let config;
let disable_image_browser;
if (!_DEV) {
  config = JSON.parse(localStorage.getItem('COZY_NEST_CONFIG'))
  disable_image_browser =
    config['disable_image_browser']
}


function App() {

  if (disable_image_browser) {
    return (
        <>
          <MockImageBrowser/>
        </>
    )
  }

  const [socketUrl, setSocketUrl] = useState(`ws://localhost:${serverPort}`);
  const [messageHistory, setMessageHistory] = useState([]);
  const [images, setImages] = useState([])
  const [filteredImages, setFilteredImages] = useState([])
  const [searchStr, setSearchStr] = useState('');
  const [emptyFetch, setEmptyFetch] = useState(false);


  const { sendMessage, lastMessage, readyState, getWebSocket }
    = useWebSocket(
      socketUrl,
      {
        shouldReconnect: () => disable_image_browser,
        reconnectAttempts: 10,
        reconnectInterval: 3000,
      }
    );

  //cheat to get the websocket object
  window.ws = getWebSocket();

  const askForImages = useCallback(() => sendMessage(
    JSON.stringify({what: "images"})), [sendMessage]
  );

  const reconnect = () => {

    if (readyState === ReadyState.OPEN) {
      console.log('already connected')
      return;
    }

    // force a dummy url change
    setSocketUrl(socketUrl + '?t=' + Date.now())

    if (!_DEV) {
      // get the #nevyui_sh_options_start_socket button from main gradio app and click it
      const button = document.querySelector('#nevyui_sh_options_start_socket');
      button.click();
    }
    else {
      console.log('dev mode - Dummy click on #nevyui_sh_options_start_socket')
    }
  }

  //get images from server and set state
  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data)
      if (data.error) {
        if (window.errorPipe) {
          window.errorPipe(data)
        }
      }
      if (data.what === 'images') {
        if (data.images.length === 0) {
          console.warn('Received empty images array from socket')
          //disable images fetch loop
          setEmptyFetch(true)
        }
        setImages(data.images)
      }
      if (data.what === 'dispatch_on_image_saved') {
        //add at the beginning of the array
        setImages(prev => [data.data, ...prev])
      }
      setMessageHistory((prev) => prev.concat(lastMessage));
    }
  }, [lastMessage, setMessageHistory]);

  //if images is empty, load images
  useEffect(() => {
    if (images.length === 0 && readyState === ReadyState.OPEN && !emptyFetch) {
      askForImages()
    }
    else {
      setFilteredImages(images)
    }
  }, [images, readyState])

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

  const connexionStatusStyle = {
    color:
      readyState === ReadyState.OPEN
        ? 'green'
        : readyState === ReadyState.CONNECTING
          ? 'orange'
          : 'red',
  };

  return (
    <>
      <Column>
        <h1 className="cnib-title">Cozy Nest Image Browser <span className="beta-emphasis">beta</span></h1>
        <Row>
          <span>The WebSocket is currently <span className="connexionStatus" style={connexionStatusStyle}>{connectionStatus}</span></span>
          <button
            className="nevysha lg primary gradio-button btn"
            style={{marginLeft: '20px', width: '100px'}}
            onClick={reconnect}
            disabled={readyState === ReadyState.OPEN}
          >
            Connect
          </button>
        </Row>

        <textarea data-testid="textbox"
                  placeholder="Search anything : Prompt, Size, Model, ..."
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
