//base url without port
import * as PropTypes from "prop-types";

const baseUrl = window.location.href.split(":")[0] + ":" + window.location.href.split(":")[1]
const gradioPort = 7860

function CozyImageInfo(props) {

  //format date to human readable eg 1683694961.5761478 to yyyy-mm-dd HH:MM:SS
  const date = new Date(props.image.metadata.date * 1000).toISOString().replace(/T/, ' ').replace(/\..+/, '')

  //extra data from image.metadata.exif.parameters
  /*
  "(masterpiece, best quality, ultra-detailed, best shadow), (detailed background), (beautiful detailed face), high contrast, (best illumination, an extremely delicate and beautiful), ((cinematic light)), colorful, hyper detail, dramatic light, intricate details,
  a Environmental portrait
  of a sexy girl, 1girl, thick eyelashes,
  with brown hair,
  crop top, hoodie, crop top hoodie, Off-the-shoulder top,
  high-waisted shorts, high-waisted shorts,
  brown eyes,
  dutch angle,
  hairband,
  thigh strap
  A cityscape with skyscrapers and busy streets
  thick,  (cyberpunk:1.5),  <lora:hugeAssAndBoobs_v1:0.7>
  Negative prompt: (worst quality, low quality:1.4), (monochrome), zombie, easynegative, bad-hands-5,
  Steps: 20, Sampler: DPM++ 2M Karras v2, CFG scale: 7, Seed: 1397741187, Size: 512x512, Model hash: 4199bcdd14, Model: revAnimated_v122, Clip skip: 2"
  */
  const model = props.image.metadata.exif.parameters.split("Model: ")[1].split(",")[0]
  const size = props.image.metadata.exif.parameters.split("Size: ")[1].split(",")[0]
  const seed = props.image.metadata.exif.parameters.split("Seed: ")[1].split(",")[0]
  const steps = props.image.metadata.exif.parameters.split("Steps: ")[1].split(",")[0]
  const sampler = props.image.metadata.exif.parameters.split("Sampler: ")[1].split(",")[0]

  return (
    <div className="image-info" onClick={() => console.log(props.image.metadata)}>
      <table>
        <tbody>
          <tr><td>Date: </td><td>{date}</td></tr>
          <tr><td>Model: </td><td>{model}</td></tr>
          <tr><td>Size: </td><td>{size}</td></tr>
          <tr><td>Seed: </td><td>{seed}</td></tr>
          <tr><td>Steps: </td><td>{steps}</td></tr>
          <tr><td>Sampler: </td><td>{sampler}</td></tr>
        </tbody>
      </table>
    </div>
  );
}

CozyImageInfo.propTypes = {image: PropTypes.any};
export default function CozyImage(props) {

  return (
    <div className="image">
      <div className="image-wrapper">
        <img
          className="cozy-nest-thumbnail"
          src={`${baseUrl}:${gradioPort}/file=${props.image.path}`}
          alt="image"/>
      </div>
      <CozyImageInfo image={props.image}/>
    </div>
  );
}