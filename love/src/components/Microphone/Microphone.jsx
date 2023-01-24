import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Bypasser from './bypasserNode';
import ManagerInterface, { parseCommanderData } from 'Utils';
import Button from '../GeneralPurpose/Button/Button';
import Input from '../GeneralPurpose/Input/Input';
// import Recorder from 'recorderjs';
// import WebAudioRecorder from 'web-audio-recorder-js';
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

  // // Global variables. // MINE
  // audioContext = new (window.AudioContext || window.webkitAudioContext)();

  // masterGain = this.audioContext.createGain();

  // volumeAudio;

  // // analyser = this.audioContext.createAnalyser();
  // // bufferLength = null;
  // // dataArray = null;

  // song = new Audio('https://playerservices.streamtheworld.com/api/livestream-redirect/CORAZON_SC');
  // songSource = this.audioContext.createMediaElementSource(this.song);

  // componentDidMount = () => {
  //   this.song.crossOrigin = 'anonymous'; // to fix CORS policy problem.

  //   this.masterGain.gain.value = 0.5; // initial volume.

  //   // this.analyser.fftSize = 2048;  // frequency resolution : window size for fft.
  //   // this.bufferLength = this.analyser.frequencyBinCount; // half of fftSize, generally number of data values you will have to play with for the dB visualization.
  //   // this.dataArray = new Float32Array(this.bufferLength);

  //   // this.analyser.maxDecibels = 120; // we set range of decibels allowed.
  //   // this.analyser.minDecibels = -150;

  //   // this.songSource.connect(this.masterGain);
  //   // this.masterGain.connect(this.audioContext.destination);

  //   // this.songSource.connect(this.analyser);
  //   // this.analyser.connect(this.audioContext.destination);

  //   // this.songSource.connect(this.masterGain);
  //   // this.masterGain.connect(this.analyser);
  //   // this.analyser.connect(this.audioContext.destination);
  // };

  // componentDidUpdate = () => {};

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

  static radiosLink = {
    biobio: 'https://redirector.dps.live/biobiosantiago/mp3/icecast.audio',
    carolina:
      'https://jireh-1-hls-audio-us-isp.dps.live/hls-audio/716888c72e2079612211a7130f67a27d/carolina/playlist/manifest/gotardisz/audio/now/livestream1.m3u8?dpssid=b2191543965963287cd50987a&sid=ba5t1l1xb287782483663287cd509878',
    futuro: 'https://playerservices.streamtheworld.com/api/livestream-redirect/FUTUROAAC_SC',
    corazon: 'https://playerservices.streamtheworld.com/api/livestream-redirect/CORAZON_SC',
    adn:
      'https://24383.live.streamtheworld.com/ADN_SC?DIST=TuneIn&TGT=TuneIn&maxServers=2&gdpr=0&us_privacy=1YNY&partnertok=eyJhbGciOiJIUzI1NiIsImtpZCI6InR1bmVpbiIsInR5cCI6IkpXVCJ9.eyJ0cnVzdGVkX3BhcnRuZXIiOnRydWUsImlhdCI6MTYzMzM5MjExNiwiaXNzIjoidGlzcnYifQ.apBDljw5PC4GQwEls0GoHYCMKg91TAZrYLziiqLdh1U',
  };

  // ========================================================
  // Audio Setup
  // ========================================================

  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = this.audioContext.createGain();
  songPlaying = false;
  song = new Audio('https://redirector.dps.live/biobiosantiago/mp3/icecast.audio');
  audioHTML = document.querySelector('#radio');
  songSource = this.audioContext.createMediaElementSource(this.song);
  audioRecorder;
  buffers;
  oscillator;

  componentDidMount = () => {
    // this.props.subscribeToStreams();

    this.song.crossOrigin = 'anonymous';
    this.masterGain.gain.value = 0.5;
    this.songSource.connect(this.masterGain);
    this.masterGain.connect(this.audioContext.destination);

    // this.audioContext.audioWorklet.addModule('audio-recorder.js')
    //   .catch(function (err) {
    //       console.log(err);
    //   }).then(() => {
    //     this.node = new AudioWorkletNode(this.audioContext, 'audio-recorder');
    //   }).catch(function(e) {console.log(e)});

    // var options = {
    //   type: 'audio',
    //   numberOfAudioChannels: 2,
    //   checkForInactiveTracks: true,
    //   bufferSize: 16384,
    //   onAnalysed: (data) => console.log(data),
    // };
    // this.recorder = new Recorder(this.songSource, options);
  };

  componentDidUpdate = () => {
    //   this.props.unsubscribeToStreams();
  };

  // async obtainDecibels() { //MINE
  //   await this.audioContext.audioWorklet.addModule('http://localhost/manager/media/vumeter-node.js');
  //   this.volumeAudio = new AudioWorkletNode(this.audioContext, 'vumeter');
  //   this.volumeAudio.port.onmessage = (event) => {
  //     let _volume = 0;
  //     if (event.data.volume) _volume = event.data.volume;

  //   this.volumeAudio.port.start();

  //   this.songSource.connect(node);
  //   node.connect(this.audioContext.destination);
  //   };
  // };

  initAudio() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.songPlaying = false;
    this.song = new Audio('https://redirector.dps.live/biobiosantiago/mp3/icecast.audio');

    this.songSource = this.audioContext.createMediaElementSource(this.song);
    this.song.crossOrigin = 'anonymous';
    this.masterGain.gain.value = 0.5;
    this.songSource.connect(this.masterGain);
    this.masterGain.connect(this.audioContext.destination);
    this.loadModule();
  }

  encodeAudio(buffers) {
    const sampleCount = buffers.reduce((memo, buffer) => {
      return memo + buffer.length;
    }, 0);

    const bytesPerSample = 16 / 8;
    const bitsPerByte = 8;
    const dataLength = sampleCount * bytesPerSample;
    const sampleRate = this.audioContext.sampleRate;

    const arrayBuffer = new ArrayBuffer(44 + dataLength);
    const dataView = new DataView(arrayBuffer);

    dataView.setUint8(0, 'R'.charCodeAt(0)); // <10>
    dataView.setUint8(1, 'I'.charCodeAt(0));
    dataView.setUint8(2, 'F'.charCodeAt(0));
    dataView.setUint8(3, 'F'.charCodeAt(0));
    dataView.setUint32(4, 36 + dataLength, true);
    dataView.setUint8(8, 'W'.charCodeAt(0));
    dataView.setUint8(9, 'A'.charCodeAt(0));
    dataView.setUint8(10, 'V'.charCodeAt(0));
    dataView.setUint8(11, 'E'.charCodeAt(0));
    dataView.setUint8(12, 'f'.charCodeAt(0));
    dataView.setUint8(13, 'm'.charCodeAt(0));
    dataView.setUint8(14, 't'.charCodeAt(0));
    dataView.setUint8(15, ' '.charCodeAt(0));
    dataView.setUint32(16, 16, true);
    dataView.setUint16(20, 1, true);
    dataView.setUint16(22, 1, true);
    dataView.setUint32(24, sampleRate, true);
    dataView.setUint32(28, sampleRate * 2, true);
    dataView.setUint16(32, bytesPerSample, true);
    dataView.setUint16(34, bitsPerByte * bytesPerSample, true);
    dataView.setUint8(36, 'd'.charCodeAt(0));
    dataView.setUint8(37, 'a'.charCodeAt(0));
    dataView.setUint8(38, 't'.charCodeAt(0));
    dataView.setUint8(39, 'a'.charCodeAt(0));
    dataView.setUint32(40, dataLength, true);

    let index = 44;

    for (const buffer of buffers) {
      for (const value of buffer) {
        dataView.setInt16(index, value * 0x7fff, true);
        index += 2;
      }
    }

    return new Blob([dataView], { type: 'audio/wav' });
  }

  async loadModule() {
    try {
      await this.audioContext.audioWorklet.addModule(process.env.PUBLIC_URL + '/worklets/bypassProcessor.js');
      console.log(`loaded module: bypass-processor.js`);
    } catch (e) {
      console.log(`Failed to load module: bypass-processor.js: `, e);
    }
    this.audioRecorder = new AudioWorkletNode(this.audioContext, 'bypassProcessor');
    this.buffers = [];

    this.audioRecorder.port.addEventListener('message', (event) => {
      // <6>
      this.buffers.push(event.data.buffer);
    });
    this.audioRecorder.port.start(); // <7>

    this.songSource.connect(this.audioRecorder); // <8>
    this.audioRecorder.connect(this.audioContext.destination);
    console.log(this.audioRecorder);
  }

  async loadVMeter() {
    try {
      await this.audioContext.audioWorklet.addModule(process.env.PUBLIC_URL + '/worklets/vmeter.js');
      console.log(`loaded module: vmeter-processor.js`);
    } catch (e) {
      console.log(`Failed to load module: vmeter-processor.js: `, e);
    }
    this.audioRecorder = new AudioWorkletNode(this.audioContext, 'vmeter-processor');

    this.audioRecorder.port.onmessage = (event) => {
      let _volume = 0;
      let _sensibility = 5; // Just to add any sensibility to our ecuation
      if (event.data.volume) _volume = event.data.volume;
      console.log((_volume * 100) / _sensibility);
    };
    this.audioRecorder.port.start(); // <7>

    this.songSource.connect(this.audioRecorder); // <8>
    this.audioRecorder.connect(this.audioContext.destination);
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
          <div>
            <p> Play Radio:</p>
            <audio controls id="radio"></audio>
          </div>
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

          {/* <button
            onClick={async () => {
              await obtainDecibels();
              // this.analyser.getFloatFrequencyData(this.dataArray)
              // console.log(this.dataArray);
              // console.log(this.bufferLength)
            }}
          >
            {' '}
            Obtain Decibels{' '}
          </button> */}

          <button
            onClick={async () => {
              // await this.loadModule();
              await this.loadModule();
            }}
          >
            loadModule
          </button>
          <button
            onClick={() => {
              const parameter = this.audioRecorder.parameters.get('isRecording');
              parameter.setValueAtTime(1, this.audioContext.currentTime); // <9>
              this.buffers.splice(0, this.buffers.length);
              console.log('start Recording');
            }}
          >
            start Record
          </button>

          <button
            onClick={() => {
              const parameter = this.audioRecorder.parameters.get('isRecording');
              parameter.setValueAtTime(0, this.audioContext.currentTime);
              console.log(this.buffers);
              const blob = this.encodeAudio(this.buffers); // <11>
              const url = URL.createObjectURL(blob);
              console.log('Stop Recording');
              const audio = document.querySelector('#audio');
              audio.src = url;
            }}
          >
            stop Record
          </button>
          {/* <p>{this.state.namesRadio}</p>
        <audio autoPlay controls="controls">
          {' '}
          <source src={this.state.linkRadio} type="audio/ogg"/>{' '}
        </audio> */}
        </div>
        <div>
          <p> GRABACION:</p>
          <audio controls id="audio"></audio>
        </div>

        <div className={styles.container}>
          <span>Microphone</span>
          <div className="volumen-wrapper">
            <div className="led"></div>
            <div className="led"></div>
            <div className="led"></div>
            <div className="led"></div>
            <div className="led"></div>

            <div className="led"></div>
            <div className="led"></div>
            <div className="led"></div>
            <div className="led"></div>
            <div className="led"></div>
          </div>

          <div className="control-audio-wrapper">
            <div id="audio" className="audio-control">
              &#127908;
            </div>
          </div>
        </div>
      </>
    );
  }
}
