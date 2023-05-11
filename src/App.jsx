import {useEffect, useState, useRef, useCallback} from 'react'
import './App.css'
import InfiniteScroll from "react-infinite-scroller";
import * as PropTypes from "prop-types";
import useWebSocket, { ReadyState } from 'react-use-websocket';

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

//base url without port
const baseUrl = window.location.href.split(":")[0] + ":" + window.location.href.split(":")[1]
const gradioPort = 7860

function Image(props) {

  return (
    <div className="image">
      <img
        className="cozy-nest-thumbnail"
        src={`${baseUrl}:${gradioPort}/file=${props.image.path}`}
        alt="image"/>
      <div className="image-info">
        {JSON.stringify(props.image.metadata)}
      </div>
    </div>
  );
}

Image.propTypes = {image: PropTypes.any};

function Browser(props) {

  const imagesRef = props.imagesRef;

  const [imagesLoaded, setImagesLoaded] = useState([])

  const loadMore = (page) => {
    //log state
    console.log(`page: ${page} imagesLoaded: ${imagesLoaded.length} imagesRef: ${imagesRef.length}`)
    //load 20 more images
    setImagesLoaded(imagesLoaded.concat(imagesRef.slice(page*20, page*20+20)))
  }

  return <div className="browser">
    <InfiniteScroll //new
      pageStart={0}
      loadMore={loadMore}
      hasMore={imagesLoaded.length < imagesRef.length}
      loader={<div className="loader">Loading ...</div>}
    >
      {imagesLoaded.map((image, index) => {
        return <Image key={index} image={image}/>
      })}
    </InfiniteScroll>
  </div>;
}

Browser.propTypes = {
  pageStart: PropTypes.number,
  loadMore: PropTypes.func,
  imagesLoaded: PropTypes.arrayOf(PropTypes.any),
  imagesRef: PropTypes.any,
  callbackfn: PropTypes.func
};

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
      {images.length > 0 && <Browser key={0} imagesRef={images}/>}
    </>
  )
}

export default App
