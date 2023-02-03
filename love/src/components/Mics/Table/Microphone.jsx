import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ManagerInterface, { parseCommanderData } from 'Utils';
import styles from './Table.module.css';
import { ReactComponent as ViewSVG } from './../SVG/view.svg';
import { ReactComponent as ViewSVGSelect } from './../SVG/viewSelect.svg';
import { ReactComponent as AlarmNSVG } from './../SVG/alarm_no.svg';
import { ReactComponent as AlarmYSVG } from './../SVG/alarm_yes.svg';
import { ReactComponent as NotificationOn } from './../SVG/notification_on.svg';
import { ReactComponent as NotificationOnSelect } from './../SVG/notification_onSelect.svg';
import { ReactComponent as NotificationOff } from './../SVG/notification_off.svg';
import { ReactComponent as NotificationOffSelect } from './../SVG/notification_offSelect.svg';
import { VegaLite } from 'react-vega';
import { DateTime } from 'luxon';
import moment from 'moment';
import StatusText from 'components/GeneralPurpose/StatusText/StatusText';
export default class Microphone extends Component {
  static propTypes = {
    /**
     * Function for the onChange event of the `<input>` element. The actual value, of the event target, is passed as argument.
     */
    mics: PropTypes.object,
    selectMic: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      isSelected: false,

      notifications: true,

      alarm: false,

      play: false,

      isRecording: false,

      actualDb: 0,

      actualFreq: 0,

      initialTime: '',

      dbLimit: 0.1,

      ampArray: [],

      timeArray: [],

      spec3D: {
        width: 500,
        height: 500,
        data: { name: 'table' },
        mark: { type: 'rect' },
        encoding: {
          x: { field: 't', type: 'temporal', axis: { title: 'TIME', format: '%H:%M:%S', grid: true } },
          y: {
            field: 'f',
            type: 'quantitative',
            axis: { title: 'FREQ [Hz]', grid: true },
            scale: { domain: [0, this.bufferLength + 1] },
          },
          color: {
            type: 'quantitative',
            field: 'amp',
            scale: { scheme: 'spectral' },
            legend: { labelColor: '#ddd', labelFontSize: 14, titleColor: '#ddd', title: 'dB', gradientLength: 450 },
          },
        },

        config: {
          background: null,
          axis: {
            gridColor: '#424242',
            tickColor: null,
            titleColor: '#ddd',
            labelColor: '#ddd',
            titleFontWeight: 750,
            labelFontWeight: 750,
            titlePadding: 16,
          },
        },
      },

      data3D: { table: [] },
    };

    // ========================================================
    // Audio Setup
    // ========================================================
    this.audioContext;
    this.masterGain;
    this.song;
    this.songSource;
    this.audioRecorder;
    this.vMeter;
    this.buffers;

    this.analyser;
    this.bufferLength;
    this.dataArray;
    this.windowTimePlot;
    this.frequencyData;
    this.countPollingIterval;
  }

  componentDidMount = () => {
    this.initAudio();

    if (this.countPollingIterval) clearInterval(this.countPollingIterval);
    this.countPollingIterval = setInterval(() => {
      this.setState((prevState) => this.getdbFrequencyData(prevState, this.getTimeUTCformat()));
    }, 1000);
  };

  /* Method to set up the audio variables*/
  initAudio() {
    //Source is the url of stream
    const { source } = this.props;
    this.source = source;

    //Init the AudioContext, masterGain to controlate the volume and AudioNode
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.song = new Audio(source);
    this.songSource = this.audioContext.createMediaElementSource(this.song);

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.smoothingTimeConstant = 0.9;
    this.analyser.fftSize = 2048; // sampling rate.
    this.bufferLength = this.analyser.frequencyBinCount; // frequency band.
    this.dataArray = new Float32Array(this.bufferLength);
    this.windowTimePlot = 7;
    this.frequencyData = Array.from({ length: this.bufferLength }, (_, index) => index);
    this.countPollingIterval;

    //Set the init gain, connect the nodes and load the AudioWorklets
    this.song.crossOrigin = 'anonymous';
    this.masterGain.gain.value = 0.4;
    this.songSource.connect(this.analyser);
    this.analyser.connect(this.masterGain);
    // this.songSource.connect(this.masterGain);
    this.masterGain.connect(this.audioContext.destination);
    this.loadModule(this.audioContext, this.songSource);
  }

  /* Method to encode the audio when is record*/
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

  /* Load Audio Worklet to Record */
  async loadModule(ctx, source) {
    try {
      await ctx.audioWorklet.addModule(process.env.PUBLIC_URL + '/worklets/recordProcessor.js');
    } catch (e) {
      console.log(`Failed to load module: record-processor.js: `, e);
    }
    this.audioRecorder = new AudioWorkletNode(ctx, 'recordProcessor');
    this.buffers = [];

    this.audioRecorder.port.addEventListener('message', (event) => {
      // <6>
      this.buffers.push(event.data.buffer);
    });
    this.audioRecorder.port.start(); // <7>

    source.connect(this.audioRecorder); // <8>
    this.audioRecorder.connect(ctx.destination);
  }

  /* Method to play o pause the microphone stream. this function is used by the mics component*/
  play = () => {
    const { audioContext, song, masterGain } = this;
    if (!this.state.play) {
      audioContext.resume();
      masterGain.gain.value = 0.5;
      song.play();
      console.log('play');
      this.setState({ play: true });
    } else {
      masterGain.gain.value = 0;
      console.log('paused');
      this.setState({ play: false });
    }
  };

  /* Method to start record o stop record the microphone stream. this function is used by the mics component*/
  record = () => {
    const { audioContext, audioRecorder, buffers } = this;
    const { id, recordPush } = this.props;

    if (!this.state.isRecording) {
      const parameter = audioRecorder.parameters.get('isRecording');
      parameter.setValueAtTime(1, audioContext.currentTime); // <9>
      buffers.splice(0, buffers.length);
      console.log('start Recording');
      this.setState({ isRecording: true });
    } else {
      this.setState({ isRecording: false });
      const blob = this.encodeAudio(buffers); // <11>
      const url = URL.createObjectURL(blob);
      console.log('blob by record function', blob);

      recordPush(id, audioContext.currentTime, url, blob);
    }
  };

  /**
   * Method to change the volume of the microphone stream. this function is used by the mics component
   * @param {*} vol: volume to set.
   */
  changeVolume = (vol) => {
    this.masterGain.gain.value = vol;
  };

  /* Method to change the isSelected state, by the mics component*/
  selectMe = () => {
    let { isSelected } = this.state;
    if (!isSelected) {
      this.setState({ isSelected: true, alarm: false });
    }
    this.setState({ isSelected: !isSelected });
  };

  /**
   *
   */
  turnNotifications = () => {
    const { notifications } = this.state;
    if (notifications) this.setState({ notifications: false, alarm: false });
    else this.setState({ notifications: true });
  };

  setDbLimitState = (dbLimit) => {
    this.setState({ dbLimit: dbLimit });
  };

  // ========================================================
  // PLOT HEAT MAP

  /**
   *
   * @param {*} prev
   * @param {*} actTimeUTC
   * @returns
   */
  getdbFrequencyData = (prev, actTimeUTC) => {
    let actTime = actTimeUTC.toISOString().substring(0, 19);
    let nextTime = this.obtainNextTimeInSeconds(actTimeUTC);

    this.analyser.getFloatFrequencyData(this.dataArray);

    let ampArray = this.dataArray;

    if (!prev.data3D.table || ampArray[0] === -Infinity) {
      return {};
    }

    const halfSR = this.audioContext.sampleRate / 2;

    // data.
    let dataCopy = { table: [] };
    dataCopy.table = prev.data3D.table;

    let mindB = -Infinity;
    let freqMaxdB = 0;

    let freqAmpArray = this.frequencyData.map(function (freq, i) {
      let index = Math.round((freq / halfSR) * ampArray.length);
      if (ampArray[index] > mindB) {
        mindB = ampArray[index];
        freqMaxdB = freq;
      }
      return { t_min: actTime, t_max: nextTime, f_min: freq, f_max: freq + 1, amp: ampArray[index] };
    });

    dataCopy.table = [...dataCopy.table, ...freqAmpArray];

    this.setState({ actualDb: mindB, actualFreq: freqMaxdB });

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
            axis: { title: 'TIME', format: '%H:%M:%S', tickCount: this.windowTimePlot - 1, grid: true },
            scale: { domain: timeDomain },
          },
          x2: {
            field: 't_max',
            type: 'temporal',
          },
          y: {
            field: 'f_min',
            type: 'quantitative',
            axis: { title: 'FREQ [Hz]', grid: true, labels: true },
            scale: { domain: [0, this.bufferLength + 1] },
          },
          y2: { field: 'f_max', type: 'quantitative' },
          color: {
            type: 'quantitative',
            field: 'amp',
            scale: { scheme: 'spectral' },
            legend: { labelColor: '#ddd', labelFontSize: 10, titleColor: '#ddd', title: 'dB', gradientLength: 450 },
          },
        },
        config: {
          background: null,
          axis: {
            gridColor: '#424242',
            tickColor: null,
            titleColor: '#ddd',
            labelColor: '#ddd',
            titleFontWeight: 750,
            labelFontWeight: 750,
            titlePadding: 16,
          },
        },
      },

      data3D: dataCopy,
    };

    return result;
  };

  /**
   *
   */
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

  /**
   *
   * @returns
   */
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

  /**
   *
   * @returns
   */
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

  /**
   *
   * @param {*} actTime
   * @returns
   */
  obtainNextTimeInSeconds(actTime) {
    const date = moment(actTime).add(1, 'seconds');
    return new Date(date.utc()._d).toISOString().substring(0, 19);
  }
  // ========================================================

  render() {
    let classSelectedMic = this.state.isSelected ? styles.selectedMic : '';

    let ntfSVG = this.state.isSelected ? (
      this.state.notifications ? (
        <NotificationOnSelect className={styles.svgTable} />
      ) : (
        <NotificationOffSelect className={styles.svgTable} />
      )
    ) : this.state.notifications ? (
      <NotificationOn className={styles.svgTable} />
    ) : (
      <NotificationOff className={styles.svgTable} />
    );

    let viewSvg = this.state.isSelected ? (
      <ViewSVGSelect className={styles.svgView} />
    ) : (
      <ViewSVG className={styles.svgView} />
    );

    let alarm = this.state.alarm ? (
      <AlarmYSVG className={styles.svgTable}></AlarmYSVG>
    ) : (
      <AlarmNSVG className={styles.svgTable}></AlarmNSVG>
    );

    const { id } = this.props;
    let mic = {
      id: id,
      recordFunc: this.record,
      playFunc: this.play,
      volumeFunc: this.changeVolume,
      selectMe: this.selectMe,
      volume: this.masterGain?.gain,
      //Plot Variables..
      actualFreq: this.state.actualFreq,
      actualDb: this.state.actualDb,
      appearInputdBLimit: this.appearInputdBLimit,
      setDbLimitState: this.setDbLimitState,
      dbLimit: this.state.dbLimit,
      spec3D: this.state.spec3D,
      data3D: this.state.data3D,
    };

    return (
      <tr className={classSelectedMic}>
        <td onClick={() => this.props.selectMic(mic)} className={styles.tdView}>
          {viewSvg}
        </td>
        <td onClick={() => this.props.selectMic(mic)} className={styles.tdIdMic}>
          <span className={styles.idMic}>{id}</span>
        </td>
        <td>
          <StatusText status="ok" title="MicStatus" small>
            Enabled
          </StatusText>
        </td>
        <td onClick={() => this.turnNotifications()}>{ntfSVG}</td>
        <td>{alarm}</td>
      </tr>
    );
  }
}
