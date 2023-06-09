import {useEffect, useRef, useState} from "react";
import CozyImage from "./CozyImage.jsx";

const _LAZY_LOAD_MARGIN = 300

export default function Browser(props) {

  const imagesRef = props.imagesRef;

  const _me = useRef(null)

  const [imagesLoaded, setImagesLoaded] = useState([])
  const [viewPort, setViewPort] = useState({
    top: 0,
    bottom: window.innerHeight + _LAZY_LOAD_MARGIN
  })

  //when imagesRef changes, reset imagesLoaded
  useEffect(() => {
    setImagesLoaded([])
  }, [imagesRef])

  //load 20 images on mount when imagesRef is set
  if (imagesRef.length > 0 && imagesLoaded.length === 0) {
    setImagesLoaded(imagesRef.slice(0, 20))
  }

  const page = Math.floor(imagesLoaded.length / 20)

  const scrollHandler = () => {
    maybeLoadMore()

    const _viewPort = {
      top: (_me.current.scrollTop - _LAZY_LOAD_MARGIN) > 0 ? (_me.current.scrollTop - _LAZY_LOAD_MARGIN) : 0,
      bottom: _me.current.scrollTop + _me.current.clientHeight + _LAZY_LOAD_MARGIN
    }
    setViewPort(_viewPort)
  }

  const maybeLoadMore = () => {
    //check if loadMoreThreshold is visible
    const loadMoreThreshold = document.getElementById("loadMoreThreshold")
    if (loadMoreThreshold.getBoundingClientRect().top < window.innerHeight) {
      //load 20 more images
      setImagesLoaded(imagesLoaded.concat(imagesRef.slice(page*20, page*20+20)))
    }
  }

  return <div className="browser nevysha nevysha-scrollable" onScroll={() => scrollHandler()} ref={_me}>
    {imagesLoaded.map((image, index) => {
      return <CozyImage key={index} index={index} image={image} viewPort={viewPort}/>
    })}
    <div id="loadMoreThreshold" className="hackyOffPageElement"/>
  </div>;
}