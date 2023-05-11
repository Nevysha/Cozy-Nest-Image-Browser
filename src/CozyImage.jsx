//base url without port
import * as PropTypes from "prop-types";
import {useState} from "react";
import {Row} from "./App.jsx";

const baseUrl = window.location.href.split(":")[0] + ":" + window.location.href.split(":")[1]
const gradioPort = 7860

function SendTo() {
  return <Row>
    <button className="nevysha lg primary gradio-button btn">txt2img</button>
    <button className="nevysha lg primary gradio-button btn">img2img</button>
    <button className="nevysha lg primary gradio-button btn">inpainting</button>
  </Row>;
}

function CozyImageInfo(props) {

  //format date to human readable eg 1683694961.5761478 to yyyy-mm-dd HH:MM:SS
  const date = new Date(props.image.metadata.date * 1000).toISOString().replace(/T/, ' ').replace(/\..+/, '')

  const model = props.image.metadata.exif.parameters.split("Model: ")[1].split(",")[0]
  const size = props.image.metadata.exif.parameters.split("Size: ")[1].split(",")[0]
  const seed = props.image.metadata.exif.parameters.split("Seed: ")[1].split(",")[0]
  const steps = props.image.metadata.exif.parameters.split("Steps: ")[1].split(",")[0]
  const sampler = props.image.metadata.exif.parameters.split("Sampler: ")[1].split(",")[0]

  return (
    <div className="image-info">
      <table>
        <tbody>
        <tr>
          <td>Date:</td>
          <td>{date}</td>
        </tr>
        <tr>
          <td>Model:</td>
          <td>{model}</td>
        </tr>
        <tr>
          <td>Size:</td>
          <td>{size}</td>
        </tr>
        <tr>
          <td>Seed:</td>
          <td>{seed}</td>
        </tr>
        <tr>
          <td>Steps:</td>
          <td>{steps}</td>
        </tr>
        <tr>
          <td>Sampler:</td>
          <td>{sampler}</td>
        </tr>
        </tbody>
      </table>
      <SendTo/>
    </div>
  );
}

function CozyFullImageInfo(props) {

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
  const modelHash = props.image.metadata.exif.parameters.split("Model hash: ")[1].split(",")[0]

  let formattedAll = props.image.metadata.exif.parameters
  //replace \n with <br>
  formattedAll = formattedAll.replace(/\n/g, "<br>")

  return (
    <div className="image-info">
      <button
        className="nevysha lg primary gradio-button btn"
        onClick={() => props.closeModal()}>
        Close
      </button>
      <table>
        <tbody>
        <tr><td>Date: </td><td>{date}</td></tr>
        <tr><td>Model: </td><td>{model}</td></tr>
        <tr><td>Model Hash: </td><td>{modelHash}</td></tr>
        <tr><td>Size: </td><td>{size}</td></tr>
        <tr><td>Seed: </td><td>{seed}</td></tr>
        <tr><td>Steps: </td><td>{steps}</td></tr>
        <tr><td>Sampler: </td><td>{sampler}</td></tr>
        </tbody>
      </table>
      <div className="blocInfo" dangerouslySetInnerHTML={{__html: formattedAll}} />
      <SendTo/>
    </div>
  );
}

export default function CozyImage(props) {

  const [showModal, setShowModal] = useState(false);

  function toggleModal() {
    console.log("close modal")
    console.log(`showModal: ${showModal}`)
    setShowModal(!showModal)
  }
  function openModal() {
    if (showModal) return
    console.log("open modal")
    console.log(`showModal: ${showModal}`)
    setShowModal(true)
  }

  return (
    <div className="image" onClick={openModal}>
      <div className="image-wrapper">
        <img
          className="cozy-nest-thumbnail"
          src={`${baseUrl}:${gradioPort}/file=${props.image.path}`}
          alt="image"/>
      </div>
      <CozyImageInfo image={props.image}/>
      {showModal && <div className="infoModal">
        <div className="image-wrapper">
          <img
            className="cozy-nest-thumbnail"
            src={`${baseUrl}:${gradioPort}/file=${props.image.path}`}
            alt="image"/>
        </div>
        <CozyFullImageInfo image={props.image} closeModal={toggleModal}/>
      </div>}
    </div>
  );
}