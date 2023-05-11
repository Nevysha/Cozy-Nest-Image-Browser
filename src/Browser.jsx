import {useState} from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import CozyImage from "./CozyImage.jsx";

export default function Browser(props) {

  const imagesRef = props.imagesRef;

  const [imagesLoaded, setImagesLoaded] = useState([])

  //load 20 images on mount when imagesRef is set
  if (imagesRef.length > 0 && imagesLoaded.length === 0) {
    setImagesLoaded(imagesRef.slice(0, 20))
  }

  const page = Math.floor(imagesLoaded.length / 20)

  const maybeLoadMore = () => {
    //check if loadMoreThreshold is visible
    const loadMoreThreshold = document.getElementById("loadMoreThreshold")
    if (loadMoreThreshold.getBoundingClientRect().top < window.innerHeight) {
      loadMore()
    }
  }

  const loadMore = () => {
    //load 20 more images
    setImagesLoaded(imagesLoaded.concat(imagesRef.slice(page*20, page*20+20)))
  }

  return <div className="browser" onScroll={() => maybeLoadMore()}>
    {imagesLoaded.map((image, index) => {
      return <CozyImage key={index} image={image}/>
    })}
    <div id="loadMoreThreshold" className="hackyOffPageElement"/>
  </div>;
}