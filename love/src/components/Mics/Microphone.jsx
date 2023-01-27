import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Bypasser from './bypasserNode';
import ManagerInterface, { parseCommanderData } from 'Utils';
import Button from '../GeneralPurpose/Button/Button';
import Input from '../GeneralPurpose/Input/Input';
// import Recorder from 'recorderjs';
// import WebAudioRecorder from 'web-audio-recorder-js';
import styles from './Microphone.module.css';
import { VegaLite } from 'react-vega';
import { DateTime } from 'luxon';

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

      play: false,
      first: true,

      spec: {
        width: 700,
        height: 200,
        mark: { type: 'line', color: 'red' },
        encoding: {
          x: { field: 't', type: 'temporal', axis: { title: 'Time', format: '%H:%M:%S', tickCount: 3 } },
          y: { field: 'dB', type: 'quantitative', axis: { title: 'Decibels' }, scale: { domain: [0, 1] } },
        },
        data: { name: 'table' },
        autosize: { resize: 'true' },
      },

      data: { table: [] },

      actualDb: 0,
      initialTime: '',
      dbLimit: 0.1,
      timeArray: [],

      counter: 0,
    };

    // ========================================================
    // Audio Setup
    // ========================================================
    const { source } = props;
    const { dbLimit } = props;
    this.source = source;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.songPlaying = false;
    this.song = new Audio(source);
    this.songSource = this.audioContext.createMediaElementSource(this.song);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Float32Array(this.bufferLength);
    this.audioRecorder;
    this.audioVolume;
    this.buffers;
    this.countPollingIterval;
  }

  componentDidMount = () => {
    this.song.crossOrigin = 'anonymous';
    this.masterGain.gain.value = 0;
    this.songSource.connect(this.masterGain);
    this.masterGain.connect(this.audioContext.destination);
    this.loadVMeter(this.audioContext, this.songSource);
    this.loadModule(this.audioContext, this.songSource);

    // setting initial time.
    // this.setState({initialTime: initialTime});
    // this.setState({data: { table: [{ t:  initialTime, dB: this.state.actualDb}]}});

    const changeStateData = (prev, actTime) => {
      if (!prev.data.table) {
        return {};
      }
      let dataCopy = { table: [] };
      dataCopy.table = prev.data.table;

      let newTimeArray;
      newTimeArray = this.state.timeArray;
      newTimeArray.push(actTime);
      this.setState({ timeArray: newTimeArray });

      if (this.state.timeArray.length === 1) {
        this.setState({ initialTime: actTime });
      }

      let newInitialTime;
      newInitialTime = this.state.initialTime;

      const dBprom = this.state.actualDb; //this.state.counter;
      //this.setState({counter: this.state.counter +0.01});

      dataCopy.table.push({ t: actTime, dBprom: dBprom, dBlimit: this.state.dbLimit });

      if (this.state.timeArray.length === 1) {
        dataCopy.table.push({ t: actTime, dBprom: dBprom, dBlimit: this.state.dbLimit });
      }

      if (this.state.timeArray.length === 5) {
        let dat2 = dataCopy.table.shift();
        let newt = newTimeArray.shift();
        this.setState({ timeArray: newTimeArray });
        newInitialTime = newTimeArray[0];
      }

      const result = {
        spec: {
          width: 700,
          height: 200,
          mark: { type: 'line' },
          transform: [{ fold: ['dBprom', 'dBlimit'] }],
          encoding: {
            x: { type: 'temporal' },
            y: { type: 'quantitative' },
            color: {
              type: 'nominal',
              scale: { domain: ['dB prom', 'dB limit'], range: ['#3E707B', '#F0E400'] },
            },
          },
          layer: [
            {
              mark: { type: 'line', color: '#3E707B', strokeWidth: 2 },
              encoding: {
                x: {
                  field: 't',
                  type: 'temporal',
                  axis: {
                    title: 'Time',
                    titleColor: '#C1CED2',
                    titleFontSize: 15,
                    titleFontStyle: 'Montserrat',
                    titleFontWeight: 'bold',
                    titlePadding: 10,
                    format: '%H:%M:%S',
                    tickCount: 4,
                    tickSize: 8,
                    tickOffset: 8,
                    labelColor: '#C1CED2',
                    labelFontSize: 12,
                    labelPadding: 5,
                    grid: false,
                  },
                  scale: { domain: [newInitialTime, actTime] },
                },
                y: {
                  field: 'dBprom',
                  type: 'quantitative',
                  axis: {
                    title: 'Decibels',
                    titleColor: '#C1CED2',
                    titleFontSize: 15,
                    titlePadding: 10,
                    titleFontStyle: 'Montserrat',
                    titleFontWeight: 'bold',
                    tickCount: 8,
                    tickSize: 8,
                    labelColor: '#C1CED2',
                    labelFontSize: 12,
                    labelPadding: 5,
                    gridColor: '#C0CDD1',
                    gridOpacity: 0.1,
                  },
                  scale: { domain: [-0.1, 1] },
                },
                color: { datum: 'dB prom' },
              },
            },
            {
              mark: { type: 'line', color: '#F0E400', strokeWidth: 0.5, strokeDash: 8.8 },
              encoding: {
                x: {
                  field: 't',
                  type: 'temporal',
                  axis: { title: 'Time', format: '%H:%M:%S', domainColor: 'black' },
                  scale: { domain: [newInitialTime, actTime] },
                },
                y: {
                  field: 'dBlimit',
                  type: 'quantitative',
                  axis: { title: 'Decibels' },
                  scale: { domain: [-0.1, 1] },
                },
                color: {
                  datum: 'dB limit',
                  offset: 0,
                  legend: { labelColor: '#C1CED2', labelFontSize: 12, labelFontStyle: 'montserrat' },
                },
              },
            },
          ],

          data: { name: 'table' },
          background: '#1A2D37',
          view: { fill: '#111F27', stroke: '#111F27', cornerRadius: 10, stroke: '#2B3F4A', strokeWidth: 7 },
          padding: { left: 15, top: 15, right: 15, bottom: 15 },
          autosize: { resize: 'true' },
        },
        data: dataCopy,
      };

      return result;
    };

    if (this.countPollingIterval) clearInterval(this.countPollingIterval);
    this.countPollingIterval = setInterval(() => {
      this.setState(
        (prevState) =>
          // {
          // if (this.state.play){

          changeStateData(prevState, this.getTime()),
        // }
        // }
      );
    }, 1000);
  };

  componentDidUpdate = () => {};

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
    } // getTime(){
    //   return DateTime.local().c.hour.toString()+":"+ DateTime.local().c.minute.toString()+ ":"+DateTime.local().c.second.toString()
    // }
    this.audioRecorder = new AudioWorkletNode(ctx, 'bypassProcessor');
    this.buffers = [];

    this.audioRecorder.port.addEventListener('message', (event) => {
      // <6>
      this.buffers.push(event.data.buffer);
    });
    this.audioRecorder.port.start(); // <7>

    source.connect(this.audioRecorder); // <8>
    this.audioRecorder.connect(ctx.destination);
    console.log(this.audioRecorder);
  }

  async loadVMeter(ctx, source) {
    try {
      await ctx.audioWorklet.addModule(process.env.PUBLIC_URL + '/worklets/vmeter.js');
      console.log(`loaded module: vmeter-processor.js`);
    } catch (e) {
      console.log(`Failed to load module: vmeter-processor.js: `, e);
    }
    this.audioVolume = new AudioWorkletNode(ctx, 'vmeter-processor');

    this.audioVolume.port.onmessage = (event) => {
      let _volume = 0;
      let _sensibility = 5; // Just to add any sensibility to our ecuation
      if (event.data.volume) _volume = event.data.volume;
      // this.leds((_volume * 100) / _sensibility);
      // console.log(_volume);
      this.setState({ actualDb: _volume });

      // source.connect(this.analyser);
      // this.analyser.connect(ctx.destination);
      // this.analyser.getFloatFrequencyData(this.dataArray);
      // console.log(this.dataArray);
    };
    this.audioVolume.port.start(); // <7>

    source.connect(this.audioVolume); // <8>
    this.audioVolume.connect(ctx.destination);
  }

  getTime() {
    const date = new Date();
    var now_utc = Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      DateTime.local().c.hour,
      DateTime.local().c.minute,
      DateTime.local().c.second,
    );

    return new Date(now_utc).toISOString().substring(0, 19);
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

    let leds = [...document.getElementsByClassName('Microphone_led__ULJam')];
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
    return (
      <>
        <div className={styles.alarmContainer}>
          <div className={styles.infoMonserratFontContainer}>
            <div className={styles.infoMonserratFont}>
              <div> Live values </div>
              <div className={styles.dBLiveValue}> {this.state.actualDb.toString().substring(0, 5)}dB</div>
            </div>
            <div className={styles.infoMonserratFont}>
              <div> Limit </div>
              <div className={styles.dBLimitValue}> {this.state.dbLimit}dB</div>
            </div>
          </div>
          <br></br>

          <div className={styles.monserratFontTitle}> ALARM STORY</div>
          <div>
            <div className={styles.inputMonserratFont}>
              <div width="10%">Insert dB limit : </div>
              <div>
                {' '}
                <Input onChange={(e) => this.setState({ dbLimit: e.target.value })} />{' '}
              </div>
            </div>
            <br></br>
            <VegaLite
              style={{
                display: 'flex',
              }}
              renderer="svg"
              spec={this.state.spec}
              data={this.state.data}
            />
            <br></br>
            <div></div>
          </div>

          <div>
            <input
              onChange={() => {
                this.masterGain.gain.value = this.changeVolume(this.props.id);
              }}
              type="range"
              id={this.props.id}
              min="0"
              max="2"
              step="0.2"
              value={this.masterGain.gain.value}
            />
          </div>

          <button
            onClick={
              /*async*/ () => {
                if (!this.state.play) {
                  this.audioContext.resume();
                  this.song.play();
                  this.setState({ play: true });
                  // await this.loadVMeter();
                } else {
                  this.masterGain.gain.value = 0;
                  // this.song.pause();
                  // this.setState({ play: false });
                }
              }
            }
          >
            Play Radio / Muted
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
              // leds((_volume * 100) / _sensibility);
              audio.src = url;
            }}
          >
            stop Record
          </button>
        </div>

        {/* RADIO 2 */}

        {/* <div>
          <div>
            <input
              onChange={() => {
                this.masterGain2.gain.value = this.changeVolume("volume2");
              }}
              type="range"
              id="volume2"
              min="0"
              max="2"
              step="0.2"
              value={this.masterGain2.gain.value}
            />
          </div>
          <button
            onClick={() => {
              if (!this.state.play) {
                this.audioContext2.resume();
                this.song2.play();
                this.setState({ play: true });
              } else {
                this.masterGain2.gain.value = 0;
                this.setState({ play: false });
              }
            }}
          >
            Play Radio / Muted
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
          onClick={() => {
            const parameter = this.audioRecorder.parameters.get('isRecording');
            parameter.setValueAtTime(1, this.audioContext2.currentTime); // <9>
            this.buffers.splice(0, this.buffers.length);
            console.log('start Recording');
          }}
        >
          start Record
        </button>

        <button
          onClick={() => {
            const parameter = this.audioRecorder.parameters.get('isRecording');
            parameter.setValueAtTime(0, this.audioContext2.currentTime);
            console.log(this.buffers);
            const blob = this.encodeAudio(this.buffers); // <11>
            const url = URL.createObjectURL(blob);
            // leds((_volume * 100) / _sensibility)
            audio.src = url;
          }}
        >
          stop Record
        </button>

        <div>
          <p> GRABACION:</p>
          <audio controls id="audio"></audio>
        </div>

        {/* <div className={styles.container}>
          <span>Microphone</span>
          <div className={styles.volumenWrapper}>
            <div id="led" className={styles.led}></div>
            <div id="led" className={styles.led}></div>
            <div id="led" className={styles.led}></div>
            <div id="led" className={styles.led}></div>
            <div id="led" className={styles.led}></div>

            <div id="led" className={styles.led}></div>
            <div id="led" className={styles.led}></div>
            <div id="led" className={styles.led}></div>
            <div id="led" className={styles.led}></div>
            <div id="led" className={styles.led}></div>
          </div>

          <div className={styles.controlAudioWrapper}>
            <div id="audio" className={styles.audioControl}>
              &#127908;
            </div>
          </div>
          </div> */}
      </>
    );
  }
}
