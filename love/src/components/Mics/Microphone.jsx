import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Bypasser from './bypasserNode';
import ManagerInterface, { parseCommanderData } from 'Utils';
import Recorder from 'recorder-js';
// import Recorder from 'recorderjs';
// import WebAudioRecorder from 'web-audio-recorder-js';
import styles from './Microphone.module.css';
import StatusText from 'components/GeneralPurpose/AlarmLabelText/AlarmLabelText';
import Value from 'components/GeneralPurpose/SummaryPanel/Value';
export default class Microphone extends Component {
  static propTypes = {
    /* Mics's id  */
    mics: PropTypes.object,
    selectMic: PropTypes.func,
    ledsFunction: PropTypes.func,
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

      play: false,
    };
    // ========================================================
    // Audio Setup
    // ========================================================
    const { source } = props;
    this.source = source;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.songPlaying = false;
    this.song = new Audio(source);
    this.songSource = this.audioContext.createMediaElementSource(this.song);
    this.audioRecorder;
    this.vMeter;
    this.buffers;

    // this.audioContext2 = new (window.AudioContext || window.webkitAudioContext)();
    // this.masterGain2 = this.audioContext2.createGain();
    // this.song2 = new Audio(RADIOSLINK.adn);
    // this.songSource2 = this.audioContext2.createMediaElementSource(this.song2);
  }

  componentDidMount = () => {
    // this.props.subscribeToStreams();

    this.song.crossOrigin = 'anonymous';
    this.masterGain.gain.value = 0;
    this.songSource.connect(this.masterGain);
    this.masterGain.connect(this.audioContext.destination);
    this.loadVMeter(this.audioContext, this.songSource);
    this.loadModule(this.audioContext, this.songSource);
  };

  componentDidUpdate = () => {
    //   this.props.unsubscribeToStreams();
  };

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

  changeVolume(id) {
    const volumeControl = document.getElementById(id);
    return volumeControl.value;
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

  async loadModule(ctx, source) {
    try {
      await ctx.audioWorklet.addModule(process.env.PUBLIC_URL + '/worklets/bypassProcessor.js');
      console.log(`loaded module: bypass-processor.js`);
    } catch (e) {
      console.log(`Failed to load module: bypass-processor.js: `, e);
    }
    this.audioRecorder = new AudioWorkletNode(ctx, 'bypassProcessor');
    this.buffers = [];

    this.audioRecorder.port.addEventListener('message', (event) => {
      // <6>
      this.buffers.push(event.data.buffer);
    });
    this.audioRecorder.port.start(); // <7>

    source.connect(this.audioRecorder); // <8>
    this.audioRecorder.connect(ctx.destination);
  }

  async loadVMeter(ctx, source) {
    try {
      await ctx.audioWorklet.addModule(process.env.PUBLIC_URL + '/worklets/vmeter.js');
      console.log(`loaded module: vmeter-processor.js`);
    } catch (e) {
      console.log(`Failed to load module: vmeter-processor.js: `, e);
    }
    this.vMeter = new AudioWorkletNode(ctx, 'vmeter-processor');

    this.vMeter.port.onmessage = (event) => {
      let _volume = 0;
      let _sensibility = 5; // Just to add any sensibility to our ecuation
      if (event.data.volume) _volume = event.data.volume;

      this.props.ledsFunction((_volume * 100) / _sensibility);
      // this.leds((_volume * 100) / _sensibility);
    };
    this.vMeter.port.start(); // <7>

    source.connect(this.vMeter); // <8>
    this.vMeter.connect(ctx.destination);

    console.log(this.vMeter);
  }

  leds(vol) {
    const ledColor = [
      '#064dac',
      '#064dac',
      '#064dac',
      '#06ac5b',
      '#15ac06',
      '#4bac06',
      '#80ac06',
      '#acaa06',
      '#ac8b06',
      '#ac5506',
    ];

    // let leds = [...document.getElementsByClassName('Microphone_led__ULJam')];
    let leds = [...document.querySelectorAll(`[id=led${this.props.id}]`)];
    let range = leds.slice(0, Math.round(vol));

    for (var i = 0; i < leds.length; i++) {
      leds[i].style.boxShadow = '-2px -2px 4px 0px #a7a7a73d, 2px 2px 4px 0px #0a0a0e5e';
      leds[i].style.height = '22px';
    }

    for (var i = 0; i < range.length; i++) {
      range[
        i
      ].style.boxShadow = `5px 2px 5px 0px #0a0a0e5e inset, -2px -2px 1px 0px #a7a7a73d inset, -2px -2px 30px 0px ${ledColor[i]} inset`;
      range[i].style.height = '25px';
    }
  }

  render() {
    // let song = new Audio('https://redirector.dps.live/biobiosantiago/mp3/icecast.audio');
    const { id } = this.props;
    const audio = document.getElementById('audio' + id);
    const mic = {
      audioContext: this.audioContext,
      masterGain: this.masterGain,
      audioRecorder: this.audioRecorder,
      song: this.song,
      buffers: this.buffers,
      vMeter: this.vMeter,
      id: id,
    };
    return (
      <tr onClick={() => this.props.selectMic(mic)}>
        <th>
          <div className={styles.trLeft}>
            <h3>{id}</h3>
          </div>
        </th>
        <th>
          <div className={styles.tr}>
            <StatusText status="ok" title="MicStatus" small>
              Enabled
            </StatusText>
          </div>
        </th>
        <th>
          <div className={styles.tr}> notifications</div>
        </th>
        <th>
          <div className={styles.trRight}>alarms</div>
        </th>
      </tr>
      // <div>
      //   <button onClick={()=> this.props.selectMic(mic)}> Select mic {id}</button>
      // </div>
    );
    /*
    return (
      <>
        <div>
          <div>
            <input
              onChange={() => {
                this.masterGain.gain.value = this.changeVolume(id);
              }}
              type="range"
              id={id}
              min="0"
              max="2"
              step="0.2"
              value={this.masterGain.gain.value}
            />
          </div>
          <button
            onClick={
              () => {
                if (!this.state.play) {
                  this.audioContext.resume();
                  this.song.play();
                  this.setState({ play: true });
                } else {
                  this.masterGain.gain.value = 0;
                  // this.song.pause();
                  this.setState({ play: false });
                }
              }}
            > Play Radio / Muted </button>

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
              audio.src = url;
              
              const a = document.getElementById('download'+id);
              a.href = url;
              a.download= 'output.wav';
              // var link = document.createElement('a');
              // link.href = url;
              // link.download ='output.wav';
              // link.click();
            }}
          >
            stop Record
          </button>
        </div>

        <div>
          Untitled view
          <p> GRABACION:</p>
          <audio controls id={'audio'+id}></audio>

          <a href="" download={'audioReocrd.wav'} id={'download'+id}>download recorder</a>
        </div>

        <div className={styles.container}>
          <span>Microphone</span>
          <div className={styles.volumenWrapper}>
            <div id={"led"+id} className={styles.led}></div>
            <div id={"led"+id} className={styles.led}></div>
            <div id={"led"+id} className={styles.led}></div>
            <div id={"led"+id} className={styles.led}></div>
            <div id={"led"+id} className={styles.led}></div>

            <div id={"led"+id} className={styles.led}></div>
            <div id={"led"+id} className={styles.led}></div>
            <div id={"led"+id} className={styles.led}></div>
            <div id={"led"+id} className={styles.led}></div>
            <div id={"led"+id} className={styles.led}></div>
          </div>
        </div>
      </>
    );*/
  }
}
