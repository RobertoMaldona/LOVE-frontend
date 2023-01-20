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

  streamFunction() {
    // // for cross browser
    const audioContext = new AudioContext();

    // // load some sound
    const stream = document.getElementById('audioStream');

    const source = audioContext.createMediaStreamSource(stream);

    const gainNode = audioContext.createGain();

    gainNode.gain.value = 0.5;

    source.connect(gainNode).connect(audioContext.destination);

    console.log(source);

    // audioElement.play()

    // Play or pause track depending on state
    // if (playButton?.getAttribute("dataplaying") === "false") {
    //       audioElement?.play();
    //       playButton?.setAttribute("dataplaying", "true");}
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

  streamFunction2() {
    let audioCtx;
    const audioElement = document.getElementById('audioStream');

    audioElement?.addEventListener('play', () => {
      audioCtx = new AudioContext();
      // Create a MediaElementAudioSourceNode
      // Feed the HTMLMediaElement into it
      let source = new MediaElementAudioSourceNode(audioCtx, {
        mediaElement: audioElement,
      });

      // Create a gain node
      let gainNode = new GainNode(audioCtx);

      // Create variables to store mouse pointer Y coordinate
      // and HEIGHT of screen
      let currentY;
      let height = window.innerHeight;

      console.log(source);

      // Get new mouse pointer coordinates when mouse is moved
      // then set new gain value

      document.onmousemove = (e) => {
        currentY = window.Event
          ? e.pageY
          : e.clientY +
            (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);

        gainNode.gain.value = currentY / height;
      };

      // connect the AudioBufferSourceNode to the gainNode
      // and the gainNode to the destination, so we can play the
      // music and adjust the volume using the mouse cursor
      source.connect(gainNode);
      gainNode.connect(audioCtx.destination);
    });
  }

  render() {
    return (
      <>
        <div>
          <audio id="audioStream" controls="controls" src="http://localhost/audiostream" type="audio/ogg">
            {' '}
          </audio>
        </div>
        <div>
          <Button
            id="buttonPlayPause"
            onClick={() => {
              this.streamFunction();
            }}
            dataplaying="true"
          >
            <span>Run Web Audio API function</span>
          </Button>
          {/* <input onChange ={()=> {this.streamFunction("volume")}}
         type="range" id="volume" min="0" max="2" value="1" step="0.01" /> */}
          {/* {this.streamFunction()} */}
        </div>
      </>
    );
  }
}
