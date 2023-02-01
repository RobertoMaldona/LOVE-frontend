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

import StatusText from 'components/GeneralPurpose/StatusText/StatusText';
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
      /* If this mic is selected to show info detail by the Mics Component*/
      isSelected: false,

      /* Notifications ON or OFF */
      notifications: true,

      /* If exists an alarm asociated to mic */
      alarm: false,

      play: false,

      isRecording: false,
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
  }

  componentDidMount = () => {
    this.initAudio();
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

    //Set the init gain, connect the nodes and load the AudioWorklets
    this.song.crossOrigin = 'anonymous';
    this.masterGain.gain.value = 0.4;
    this.songSource.connect(this.masterGain);
    this.masterGain.connect(this.audioContext.destination);
    this.loadVMeter(this.audioContext, this.songSource);
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

  /* Load Audio Worklet to calculate desibels */
  async loadVMeter(ctx, source) {
    try {
      await ctx.audioWorklet.addModule(process.env.PUBLIC_URL + '/worklets/vmeter.js');
    } catch (e) {
      console.log(`Failed to load module: vmeter-processor.js: `, e);
    }
    this.vMeter = new AudioWorkletNode(ctx, 'vmeter-processor');

    this.vMeter.port.onmessage = (event) => {
      let _volume = 0;
      let _sensibility = 5; // Just to add any sensibility to our ecuation
      if (event.data.volume) _volume = event.data.volume;
      if (event.data.max > 0.7) {
        console.log(event.data.max);
        if (this.state.notifications && !this.state.isSelected) this.setState({ alarm: true });
      }
    };
    this.vMeter.port.start(); // <7>

    source.connect(this.vMeter); // <8>
    this.vMeter.connect(ctx.destination);
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

  /* Method to change the volume of the microphone stream. this function is used by the mics component*/
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

  turnNotifications = () => {
    const { notifications } = this.state;
    if (notifications) this.setState({ notifications: false, alarm: false });
    else this.setState({ notifications: true });
  };

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
    const mic = {
      id: id,
      recordFunc: this.record,
      playFunc: this.play,
      volumeFunc: this.changeVolume,
      selectMe: this.selectMe,
      volume: this.masterGain?.gain,
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
