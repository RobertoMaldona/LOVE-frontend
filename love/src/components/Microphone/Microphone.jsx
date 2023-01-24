import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ManagerInterface, { parseCommanderData } from 'Utils';
import Button from '../GeneralPurpose/Button/Button';
import Input from '../GeneralPurpose/Input/Input';
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
      micsState: {}, // aquí deberíamos agregar dB limit y dB range.

      /* Notifications ON or OFF */
      notifications: {},

      /* If exists an alarm asociated to mic */
      alarms: {},

      /* The id of the selected mic to show the info */
      selectedMic: null,

      linkRadio: 'https://redirector.dps.live/biobiosantiago/mp3/icecast.audio',
      namesRadio: 'biobio',
      play: false,
      volume: 0,
    };
  }

  // Global variables.
  audioContext = new (window.AudioContext || window.webkitAudioContext)();

  masterGain = this.audioContext.createGain();

  volumeAudio;

  // analyser = this.audioContext.createAnalyser();
  // bufferLength = null;
  // dataArray = null;

  song = new Audio('https://playerservices.streamtheworld.com/api/livestream-redirect/CORAZON_SC');
  songSource = this.audioContext.createMediaElementSource(this.song);

  componentDidMount = () => {
    this.song.crossOrigin = 'anonymous'; // to fix CORS policy problem.

    this.masterGain.gain.value = 0.5; // initial volume.

    // this.analyser.fftSize = 2048;  // frequency resolution : window size for fft.
    // this.bufferLength = this.analyser.frequencyBinCount; // half of fftSize, generally number of data values you will have to play with for the dB visualization.
    // this.dataArray = new Float32Array(this.bufferLength);

    // this.analyser.maxDecibels = 120; // we set range of decibels allowed.
    // this.analyser.minDecibels = -150;

    // this.songSource.connect(this.masterGain);
    // this.masterGain.connect(this.audioContext.destination);

    // this.songSource.connect(this.analyser);
    // this.analyser.connect(this.audioContext.destination);

    // this.songSource.connect(this.masterGain);
    // this.masterGain.connect(this.analyser);
    // this.analyser.connect(this.audioContext.destination);
  };

  componentDidUpdate = () => {};

  changeRadio() {
    const radiosLink = {
      biobio: 'https://redirector.dps.live/biobiosantiago/mp3/icecast.audio',
      carolina:
        'https://jireh-1-hls-audio-us-isp.dps.live/hls-audio/716888c72e2079612211a7130f67a27d/carolina/playlist/manifest/gotardisz/audio/now/livestream1.m3u8?dpssid=b2191543965963287cd50987a&sid=ba5t1l1xb287782483663287cd509878',
      futuro: 'https://playerservices.streamtheworld.com/api/livestream-redirect/FUTUROAAC_SC',
      corazon: 'https://playerservices.streamtheworld.com/api/livestream-redirect/CORAZON_SC',
      adn:
        'https://24383.live.streamtheworld.com/ADN_SC?DIST=TuneIn&TGT=TuneIn&maxServers=2&gdpr=0&us_privacy=1YNY&partnertok=eyJhbGciOiJIUzI1NiIsImtpZCI6InR1bmVpbiIsInR5cCI6IkpXVCJ9.eyJ0cnVzdGVkX3BhcnRuZXIiOnRydWUsImlhdCI6MTYzMzM5MjExNiwiaXNzIjoidGlzcnYifQ.apBDljw5PC4GQwEls0GoHYCMKg91TAZrYLziiqLdh1U',
    };
    const namesRadio = ['biobio', 'carolina', 'futuro', 'corazon', 'adn'];
    const indice = Math.floor(Math.random() * namesRadio.length);
    this.setState({ linkRadio: radiosLink[namesRadio[indice]], namesRadio: namesRadio[indice] });
    document.querySelector('audio').load();
  }

  changeVolume() {
    const volumeControl = document.getElementById('volume');
    return volumeControl.value;
  }

  async obtainDecibels() {
    await this.audioContext.audioWorklet.addModule('http://localhost/manager/media/vumeter-node.js');
    this.volumeAudio = new AudioWorkletNode(this.audioContext, 'vumeter');
    this.volumeAudio.port.onmessage = (event) => {
      let _volume = 0;
      if (event.data.volume) _volume = event.data.volume;
    };

    this.volumeAudio.port.start();

    this.songSource.connect(node);
    node.connect(this.audioContext.destination);
  }

  // createCanvas(){
  //     //Create 2D canvas
  //     const canvas = document.getElementById("canvas")
  //     const canvasCtx = canvas?.getContext("2d");
  //     canvasCtx?.clearRect(0, 0, canvas.width, canvas.height);
  // }

  // draw() {
  //   const canvas = document.getElementById("canvas")
  //   const canvasCtx = canvas?.getContext("2d");

  //   //Schedule next redraw
  //   window.requestAnimationFrame(draw);

  //   //Get spectrum data
  //   this.analyser.getFloatFrequencyData(dataArray);

  //   //Draw black background
  //   canvasCtx.fillStyle = "rgb(0, 0, 0)";
  //   canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  //   //Draw spectrum
  //   const barWidth = (canvas.width / bufferLength) * 2.5;
  //   let posX = 0;
  //   for (let i = 0; i < bufferLength; i++) {
  //     const barHeight = (dataArray[i] + 140) * 2;
  //     canvasCtx.fillStyle =
  //       "rgb(" + Math.floor(barHeight + 100) + ", 50, 50)";
  //     canvasCtx.fillRect(
  //       posX,
  //       canvas.height - barHeight / 2,
  //       barWidth,
  //       barHeight / 2
  //     );
  //     posX += barWidth + 1;
  //   }
  // }

  render() {
    return (
      <>
        <div>
          {/* <canvas id ="canvas" width="640" height="627" className= {styles.canvas}></canvas> */}
          {/* <div>{this.createCanvas()}</div>
          <div>{this.draw()}</div> */}
          <button
            onClick={() => {
              if (!this.state.play) {
                this.audioContext.resume();
                this.song.play();
                this.setState({ play: true });
              } else {
                this.song.pause();
                this.setState({ play: false });
              }
            }}
          >
            Play/Stop Radio
          </button>

          <input
            onChange={() => {
              this.masterGain.gain.value = this.changeVolume();
            }}
            type="range"
            id="volume"
            min="0"
            max="2"
            step="0.2"
          />

          <button
            onClick={async () => {
              await obtainDecibels();
              // this.analyser.getFloatFrequencyData(this.dataArray)
              // console.log(this.dataArray);
              // console.log(this.bufferLength)
            }}
          >
            {' '}
            Obtain Decibels{' '}
          </button>

          <button
            onClick={() => {
              console.log(this.recorder);
              this.recorder
                .start()
                .catch(function (err) {
                  console.log(err);
                })
                .then(() => {
                  console.log('Recording started');
                });
            }}
          >
            Record
          </button>
          <button
            onClick={() => {
              this.recorder.stop().then(({ blob, buffer }) => {
                this.blob = blob;
              });
              // this.recorder.exportWAV(this.createDownloadLink);
              console.log('Recording started');
              console.log('Blob:', this.blob);
            }}
          >
            Stop Record
          </button>
          {/* <p>{this.state.namesRadio}</p>
        <audio autoPlay controls="controls">
          {' '}
          <source src={this.state.linkRadio} type="audio/ogg"/>{' '}
        </audio> */}
        </div>
        <ol id="recordingsList"></ol>
      </>
    );
  }
}
