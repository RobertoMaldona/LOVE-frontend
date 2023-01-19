import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ManagerInterface, { parseCommanderData } from 'Utils';
import Button from '../GeneralPurpose/Button/Button';

import styles from './Microphone.module.css';

export default class Microphone extends Component {
  static propTypes = {
    /* Mics's id  */
    mics: PropTypes.object,
  };

  constructor(props) {
    super(props);
    //   this.temperaturePlotRef = React.createRef();

    this.state = {
      /* Active or Descative */
      micsState: {},

      /* Notifications ON or OFF */
      notifications: {},

      /* If exists an alarm asociated to mic */
      alarms: {},

      /* The id of the selected mic to show the info */
      selectedMic: null,
    };

    const radiosLink = {
      biobio: 'https://redirector.dps.live/biobiosantiago/mp3/icecast.audio',
    };
  }

  componentDidMount = () => {
    //   this.props.subscribeToStreams();
  };

  capabilitiesFunction() {}

  componentWillUnmount = () => {
    //   this.props.unsubscribeToStreams();
  };

  streamFunction(tipo) {
    // for cross browser
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // load some sound
    const audioElement = document.getElementById('audioStream');
    // const audioElement = new Audio();
    // audioElement.type = "audio/ogg"
    // audioElement.src = "http://localhost/audiostream"
    // audioElement.controls = "controls"
    // audioElement.autoplay = "true";
    // audioElement.muted = "true";

    const stream = audioContext.createMediaElementSource(audioElement);

    stream.connect(audioContext.destination);

    const playButton = document.getElementById('buttonPlayPause');

    // if (audioContext.state === "suspended") {
    //       audioContext.resume();
    //     }

    if (tipo === 'play') {
      audioElement.play();
    }

    if (tipo === 'volume') {
      const gainNode = audioContext.createGain();

      track.connect(gainNode).connect(audioContext.destination);

      const volumeControl = document.getElementbyId('volume');

      gainNode.gain.value = 12;
    }

    // console.log(audioElement)

    // // Play or pause track depending on state
    // if (playButton?.getAttribute("dataplaying") === "false") {
    //       audioElement?.play();
    //       playButton?.setAttribute("dataplaying", "true");
    // } else if (playButton?.getAttribute("dataplaying") === "true") {
    //       audioElement?.pause();
    //       playButton?.setAttribute("dataplaying", "false");
    // };

    // audioElement.addEventListener(
    //   "ended",
    //   () => {
    //     playButton.dataset.playing = "false";
    //   },
    //   false
    // );

    // const gainNode = audioContext.createGain();

    // track.connect(gainNode).connect(audioContext.destination);

    // const volumeControl = document.querySelector("#volume");

    // volumeControl.addEventListener(
    //   "input",
    //   () => {
    //     gainNode.gain.value = volumeControl.value;
    //   },
    //   false
    // );
  }

  render() {
    return (
      <>
        <div>
          <audio id="audioStream" src="http://localhost/audiostream" type="audio/ogg" controls="controls"></audio>
        </div>
        <div>
          {/* onClick={() => {this.streamFunction()}} */}
          <Button
            id="buttonPlayPause"
            onClick={() => {
              this.streamFunction('play');
            }}
            dataplaying="false"
            role="switch"
            ariachecked="false"
          >
            <span>Run Web Audio API function</span>
          </Button>
          <br></br>
          {/* <input onChange ={()=> {this.streamFunction("volume")}}
         type="range" id="volume" min="0" max="2" value="1" step="0.01" /> */}
        </div>
        {/* <div>{this.streamFunction()}</div> */}
      </>
    );
  }
}
