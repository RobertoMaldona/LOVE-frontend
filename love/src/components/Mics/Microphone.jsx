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
import { act } from 'react-dom/test-utils';
import moment from 'moment';

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

      actualDb: 0,

      actualFreq: 0,

      initialTime: '',

      dbLimit: 0.1,

      ampArray: [],

      timeArray: [],

      counter: 0,

      spec: {
        width: 1000,
        height: 200,
        mark: { type: 'line' },
        transform: [{ fold: ['dBprom', 'dBlimit'] }],
        encoding: {
          x: { type: 'temporal' },
          y: { type: 'quantitative' },
          color: {
            type: 'nominal',
            scale: { domain: ['dB prom', 'dB upper limit'], range: ['#3E707B', '#F0E400'] },
          },
        },
        layer: [
          {
            encoding: {
              x: {
                field: 't',
                type: 'temporal',
                axis: {
                  title: 'Time',
                  titleColor: '#C1CED2',
                  titleFontSize: 15,
                  titleFontWeight: 'bold',
                  titlePadding: 10,
                  format: '%H:%M:%S',
                  tickCount: 5,
                  tickSize: 8,
                  labelColor: '#C1CED2',
                  labelFontSize: 12,
                  labelPadding: 5,
                  grid: false,
                },
              },
              y: {
                field: 'dBprom',
                type: 'quantitative',
                axis: {
                  title: 'Decibels',
                  titleColor: '#C1CED2',
                  titleFontSize: 15,
                  titlePadding: 10,
                  titleFontWeight: 'bold',
                  tickCount: 5,
                  tickSize: 8,
                  labelColor: '#C1CED2',
                  labelFontSize: 12,
                  labelPadding: 5,
                  gridColor: '#C0CDD1',
                  gridOpacity: 0.1,
                },
                scale: { domain: [-0.1, 1] },
              },
            },
          },
          {
            mark: { type: 'line', color: '#F0E400', strokeWidth: 0.5, strokeDash: 8.8 },
            encoding: {
              x: {
                field: 't',
                type: 'temporal',
                axis: { title: 'Time', format: '%H:%M:%S', domainColor: 'black' },
              },
              y: {
                field: 'dBlimit',
                type: 'quantitative',
                axis: { title: 'Decibels' },
                scale: { domain: [-0.1, 1] },
              },
              color: {
                datum: 'dB upper limit',
                legend: { labelColor: '#C1CED2', labelFontSize: 15, symbolStrokeWidth: 7, symbolSize: 10 },
              },
            },
          },
        ],
        data: { name: 'table' },
        background: '#1A2D37',
        view: { fill: '#111F27', stroke: '#111F27', cornerRadius: 10, stroke: '#2B3F4A', strokeWidth: 10 },
        padding: { left: 15, top: 15, right: 15, bottom: 15 },
        data: { name: 'table' },
        autosize: { resize: 'true' },
      },
      data: { table: [] },

      spec3D: {
        width: 500,
        height: 500,
        data: { name: 'table' },
        mark: { type: 'bar' },
        encoding: {
          x: { field: 't', type: 'temporal', axis: { title: 'Time', format: '%H:%M:%S', tickCount: 5, grid: true } },
          y: {
            field: 'f',
            type: 'quantitative',
            axis: { title: 'Frequency [Hz]', grid: true },
            scale: { domain: [0, this.bufferLength + 1] },
          },
          color: { type: 'quantitative', field: 'amp', scale: { scheme: 'plasma' } },
        },
      },

      data3D: { table: [] },

      counter: 0,

      first: true,
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
    this.analyser.fftSize = 1024; // sampling rate.
    this.bufferLength = this.analyser.frequencyBinCount; // frequency band.
    this.dataArray = new Float32Array(this.bufferLength);
    this.windowTimePlot = 30;
    this.frequencyData = Array.from({ length: this.bufferLength }, (_, index) => index);
    this.countPollingIterval;

    this.audioRecorder;
    this.audioVolume;
    this.buffers;
  }

  componentDidMount = () => {
    this.song.crossOrigin = 'anonymous';
    this.masterGain.gain.value = 0;

    this.songSource.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    this.analyser.connect(this.masterGain);
    this.masterGain.connect(this.audioContext.destination);

    // this.loadVMeter(this.audioContext, this.songSource);
    this.loadModule(this.audioContext, this.songSource);

    // PLOT 2D;
    const getdbPromData = (prev, actTime) => {
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

      const dBprom = this.state.actualDb; //this.state.counter; //
      //this.setState({counter: this.state.counter +0.01});

      dataCopy.table.push({ t: actTime, dBprom: dBprom, dBlimit: this.state.dbLimit });

      // if (this.state.timeArray.length === 1) {
      //   dataCopy.table.push({ t: actTime, dBprom: dBprom, dBlimit: this.state.dbLimit });
      // }

      if (this.state.timeArray.length === 6) {
        let dat2 = dataCopy.table.shift();
        let newt = newTimeArray.shift();
        this.setState({ timeArray: newTimeArray });
        newInitialTime = newTimeArray[0];
      }

      const result = {
        spec: {
          width: 1000,
          height: 200,
          mark: { type: 'line' },
          transform: [{ fold: ['dBprom', 'dBlimit'] }],
          encoding: {
            x: { type: 'temporal' },
            y: { type: 'quantitative' },
            color: {
              type: 'nominal',
              scale: { domain: ['dB prom', 'dB upper limit'], range: ['#3E707B', '#F0E400'] },
            },
          },
          layer: [
            {
              mark: { type: 'point', color: '#3E707B', strokeWidth: 5 },
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
                    tickCount: 5,
                    tickSize: 8,
                    tickOffset: 0,
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
                    tickCount: 5,
                    tickSize: 8,
                    labelColor: '#C1CED2',
                    labelFontSize: 12,
                    labelPadding: 5,
                    gridColor: '#C0CDD1',
                    gridOpacity: 0.1,
                  },
                  scale: { domain: [-0.1, 1] },
                },
                color: {
                  datum: 'dB prom',
                  condition: { test: `datum.dBprom > ${this.state.dbLimit}`, value: '#F0E400' },
                },
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
                  datum: 'dB upper limit',
                  legend: { labelColor: '#C1CED2', labelFontSize: 15, symbolStrokeWidth: 7, symbolSize: 10 },
                },
              },
            },
          ],

          data: { name: 'table' },
          background: '#1A2D37',
          view: { fill: '#111F27', stroke: '#111F27', cornerRadius: 10, stroke: '#2B3F4A', strokeWidth: 10 },
          padding: { left: 15, top: 15, right: 15, bottom: 15 },
          autosize: { resize: 'true' },
        },
        data: dataCopy,
      };

      return result;
    };
    // if (this.countPollingIterval) clearInterval(this.countPollingIterval);
    // this.countPollingIterval = setInterval(() => {
    //   this.setState(
    //     (prevState) =>
    //       getdbPromData(prevState, this.getTime()));
    // }, 1000);

    // PLOT 3D;
    const getdbFrequencyData = (prev, actTimeUTC) => {
      let actTime = actTimeUTC.toISOString().substring(0, 19);
      let nextTime = this.obtainNextTimeInSeconds(actTimeUTC);

      this.analyser.getFloatFrequencyData(this.dataArray);

      let ampArray = this.dataArray;

      if (!prev.data.table || ampArray[0] === -Infinity) {
        return {};
      }

      const halfSR = this.audioContext.sampleRate / 2;

      this.setState({ counter: this.counter + 1 });

      // data.
      let dataCopy = { table: [] };
      dataCopy.table = prev.data3D.table;

      let mindB = -Infinity;
      let freqMindB = 0;

      let freqAmpArray = this.frequencyData.map(function (freq, i) {
        let index = Math.round((freq / halfSR) * ampArray.length);
        if (Math.abs(ampArray[index]) > min) {
          min = ampArray[index];
          freqMindB = index;
        }
        return { t_min: actTime, t_max: nextTime, f_min: freq, f_max: freq + 1, amp: ampArray[index] };
      });

      dataCopy.table = [...dataCopy.table, ...freqAmpArray];

      this.setState({ actualDb: min });

      // timing.
      let timeDomain;
      let newInitialTime;
      let newTimeArray;

      newTimeArray = this.state.timeArray;
      newTimeArray.push(actTime);
      this.setState({ timeArray: newTimeArray });

      // set window time.
      if (this.state.timeArray.length === this.windowTimePlot) {
        dataCopy.table.splice(0, this.bufferLength);
        newTimeArray.shift();
        this.setState({ timeArray: newTimeArray });
        this.setState({ initialTime: newTimeArray[0] });
      }

      if (this.state.timeArray.length === 1) {
        this.setState({ initialTime: actTime });
        timeDomain = [actTime, nextTime];
      } else {
        newInitialTime = newTimeArray[0];
        timeDomain = [newInitialTime, nextTime];
      }

      // we return vega lite parameter with changes.
      const result = {
        spec3D: {
          width: 500,
          height: 500,
          data: { name: 'table' },
          mark: { type: 'rect' },
          encoding: {
            x: {
              field: 't_min',
              type: 'temporal',
              axis: { title: 'Time', format: '%H:%M:%S', tickCount: this.windowTimePlot - 1, grid: true },
              scale: { domain: timeDomain },
            },
            x2: {
              field: 't_max',
              type: 'temporal',
              axis: { title: 'Time', format: '%H:%M:%S', tickCount: this.windowTimePlot - 1, grid: true },
            },
            y: {
              field: 'f_min',
              type: 'quantitative',
              axis: { title: 'Frequency [Hz]', grid: true, labels: true },
              scale: { domain: [0, this.bufferLength + 1] },
            },
            y2: { field: 'f_max', type: 'quantitative', axis: { title: 'Frequency [Hz]', grid: true, labels: true } },
            color: { type: 'quantitative', field: 'amp', scale: { scheme: 'plasma' } },
          },
        },

        data3D: dataCopy,
      };

      return result;
    };

    if (this.countPollingIterval) clearInterval(this.countPollingIterval);
    this.countPollingIterval = setInterval(() => {
      this.setState((prevState) => getdbFrequencyData(prevState, this.getTimeUTCformat()));
    }, 1000);
  };

  getFrecuencyValue(frecuency, dataArray) {
    const nyquist = this.bufferLength;
    const index = Math.round((frequency / nyquist) * dataArray.length);
    return dataArray[index];
  }

  componentDidUpdate = () => {};

  initAudio() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.songPlaying = false;
    this.song = new Audio('https://playerservices.streamtheworld.com/api/livestream-redirect/CORAZON_SC');

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
      // this.analyser.connect(ctx.destinaticonsoleon);
      // this.analyser.getFloatFrequencyData(this.dataArray);
      // console.log(this.dataArray);
    };
    this.audioVolume.port.start(); // <7>

    source.connect(this.audioVolume); // <8>
    this.audioVolume.connect(ctx.destination);
  }

  appearInputdBLimit() {
    const input = document.getElementById('hideInputdBLimit');
    const display = document.getElementById('InitialdBLimit');
    if (input.style.display === 'none') {
      input.style.display = 'block';
      display.style.display = 'none';
    } else {
      input.style.display = 'none';
      display.style.display = 'block';
    }
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

  getTimeUTCformat() {
    const date = new Date();
    var now_utc = Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      DateTime.local().c.hour,
      DateTime.local().c.minute,
      DateTime.local().c.second,
    );

    return new Date(now_utc);
  }

  obtainNextTimeInSeconds(actTime) {
    const date = moment(actTime).add(1, 'seconds');
    return new Date(date.utc()._d).toISOString().substring(0, 19);
  }

  render() {
    // console.log(this.state.data3D.table)
    // const time = this.getTimeUTCformat();
    // console.log(time, this.obtainNextTimeInSeconds(time));
    return (
      <>
        <div className={styles.alarmContainer}>
          <div className={styles.infoMonserratFontContainer}>
            <div className={styles.infoMonserratFont}>
              <div> Live values </div>
              <div className={styles.dBLiveValue}> {this.state.actualDb.toString().substring(0, 5)}dB</div>
            </div>

            <div className={styles.infoMonserratFont}>
              <div className={styles.buttondBLimit}>
                Limit
                <Button
                  className={styles.editButtondBLimit}
                  onClick={() => {
                    this.appearInputdBLimit();
                  }}
                >
                  <svg width="20" height="20" viewBox="10 0 10 20">
                    <line className={styles.svgEdit} x1="8.34" y1="2.09" x2="7.58" y2="1.38" />
                    <line className={styles.svgEdit} x1="8.72" y1="1.73" x2="7.96" y2="1.02" />
                    <polyline className={styles.svgEdit} points="4.16 1.66 .15 1.66 .15 9.48 7.97 9.48 7.97 5.49" />
                    <path
                      fill="white"
                      d="m8.69.3h0,0m0,0l.68.67-4.79,4.8-.68-.67,4-4,.79-.79m0-.3c-.07,0-.15.03-.21.09l-.8.8-4,4c-.11.11-.11.3,0,.41l.68.68c.06.06.13.09.21.09s.15-.03.21-.09L9.58,1.18c.11-.11.11-.3,0-.41l-.68-.68c-.06-.06-.13-.09-.21-.09h0Z"
                    />
                    <polyline className={styles.svgEdit} points="3.63 5.13 2.93 6.74 4.58 6" />
                  </svg>
                </Button>
              </div>
              <div className={styles.inputdBLimit}>
                <div className={styles.hideInputDiv}>
                  <Input
                    id="hideInputdBLimit"
                    className={styles.hideInput}
                    onChange={(e) => this.setState({ dbLimit: e.target.value })}
                  />
                </div>
                <div id="InitialdBLimit" display="flex">
                  {' '}
                  {this.state.dbLimit}
                </div>
                <div>dB</div>
              </div>
            </div>
          </div>
          <br></br>

          <div></div>

          <div className={styles.monserratFontTitle}> ALARM STORY</div>

          {/* Vega 2D plot: dB prom vs t*/}
          {/* <div> 
            <br></br>
              <VegaLite style={{ display: 'flex',}} renderer="svg" spec={this.state.spec} data={this.state.data}/>
            <br></br>
          </div> */}
          {/* Vega 3D plot: dB vs F vs t */}
          <div>
            <br></br>
            <VegaLite style={{ display: 'flex' }} renderer="svg" spec={this.state.spec3D} data={this.state.data3D} />
            <br></br>
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
