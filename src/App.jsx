import {useEffect, useState, useRef} from 'react'
import './App.css'
import InfiniteScroll from "react-infinite-scroller";
import * as PropTypes from "prop-types";

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

  const imagesRef = props.imagesRef.current;

  const [imagesLoaded, setImagesLoaded] = useState([])
  const [page, setPage] = useState(0)

  const loadMore = () => {
    //log state
    console.log(`page: ${page} imagesLoaded: ${imagesLoaded.length} imagesRef: ${imagesRef.length}`)
    //load 20 more images
    setImagesLoaded(imagesLoaded.concat(imagesRef.current.slice(page*20, page*20+20)))
    setPage(page+1)
  }

  return <div className="browser">
    <InfiniteScroll //new
      pageStart={page}
      loadMore={loadMore}
      hasMore={imagesLoaded.length < imagesRef.length}
      loader={<div className="loader">Loading ...</div>}
      useWindow={false}
    >
      {props.imagesLoaded.map((image, index) => {
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

  const imagesRef = useRef([])



  //get images from server and set state
  useEffect(() => {
    async function getImages() {

      if (imagesRef.current.length > 0) return

      const socket = await getSocket();

      console.log("getImages")

      socket.send(JSON.stringify(
        {what: "images"}
      ))
      socket.onmessage = (event) => {
        imagesRef.current = JSON.parse(event.data).images
      }
    }

    getImages()
  }, [])

  return (
    <>
      <h1>Cozy Nest Image Browser</h1>
      {imagesRef.current.length > 0 && <Browser key={0} imagesRef={imagesRef}/>}
    </>
  )
}

export default App
