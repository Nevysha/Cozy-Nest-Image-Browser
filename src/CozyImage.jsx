//base url without port
const baseUrl = window.location.href.split(":")[0] + ":" + window.location.href.split(":")[1]
const gradioPort = 7860

export default function CozyImage(props) {

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