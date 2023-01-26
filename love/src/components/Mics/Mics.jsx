import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ManagerInterface, { parseCommanderData } from 'Utils';
import styles from './Microphone.module.css';
import Microphone from './Microphone';
import Button from 'components/GeneralPurpose/Button/Button';
import Record from './Record';

const RADIOSLINK = {
  biobio: 'https://redirector.dps.live/biobiosantiago/mp3/icecast.audio',
  carolina:
    'https://jireh-1-hls-audio-us-isp.dps.live/hls-audio/716888c72e2079612211a7130f67a27d/carolina/playlist/manifest/gotardisz/audio/now/livestream1.m3u8?dpssid=b2191543965963287cd50987a&sid=ba5t1l1xb287782483663287cd509878',
  futuro: 'https://playerservices.streamtheworld.com/api/livestream-redirect/FUTUROAAC_SC',
  corazon: 'https://playerservices.streamtheworld.com/api/livestream-redirect/CORAZON_SC',
  adn:
    'https://24383.live.streamtheworld.com/ADN_SC?DIST=TuneIn&TGT=TuneIn&maxServers=2&gdpr=0&us_privacy=1YNY&partnertok=eyJhbGciOiJIUzI1NiIsImtpZCI6InR1bmVpbiIsInR5cCI6IkpXVCJ9.eyJ0cnVzdGVkX3BhcnRuZXIiOnRydWUsImlhdCI6MTYzMzM5MjExNiwiaXNzIjoidGlzcnYifQ.apBDljw5PC4GQwEls0GoHYCMKg91TAZrYLziiqLdh1U',
};

export default class Mics extends Component {
  static propTypes = {
    /* Mics's id  */
    mics: PropTypes.object,
  };

  constructor(props) {
    super(props);
    //   this.temperaturePlotRef = React.createRef();

    this.state = {
      /* The current microphone to show details */
      currentMic: null,

      /* Notifications ON or OFF */
      notifications: {},

      /* If exists an alarm asociated to mic */
      alarms: {},

      viewInfo: false,

      play: false,

      isRecording: false,

      records: [],
    };
  }

  //Functions to microphone. /////
  leds = (vol) => {
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
    let leds = [...document.querySelectorAll(`[id=led]`)];
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
  };

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
    const sampleRate = this.state.currentMic ? this.state.currentMic.audioContext.sampleRate : 0;

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

  ///

  componentDidUpdate = (prevProps, prevState) => {
    // if(this.state.currentMic !== prevState.currentMic){
    //     const {vMeter} = this.state.currentMic;
    //     console.log(vMeter);
    //     vMeter.port.start();
    // }
  };

  selectMic = (mic) => {
    this.setState({ currentMic: mic, viewInfo: true });
  };

  openFinishedList = () => {
    this.setState({
      viewInfo: true,
    });
  };

  closeMicDetails = () => {
    this.setState({ viewInfo: false });
  };

  record = (aCtx, aRcr, bufs, id) => {
    if (!this.state.isRecording) {
      const parameter = aRcr.parameters.get('isRecording');
      parameter?.setValueAtTime(1, aCtx.currentTime); // <9>
      bufs?.splice(0, bufs.length);
      console.log('start Recording');
      this.setState({ isRecording: true });
    } else {
      const parameter = aRcr.parameters.get('isRecording');
      const currentTime = aCtx.currentTime;
      parameter.setValueAtTime(0, currentTime);

      this.setState({ isRecording: false });
      console.log('stop Recording');

      const blob = this.encodeAudio(bufs); // <11>
      const url = URL.createObjectURL(blob);

      this.setState((prevState) => {
        let prevRecords = prevState.records;
        prevRecords.push({ nameFile: id + currentTime.toString(), url: url });
        return { records: prevRecords };
      });
    }
  };

  render() {
    const finishedScriptListClass = this.state.viewInfo ? '' : styles.collapsedScriptList;
    const peelableDetail = this.state.viewInfo ? styles.micDetails : styles.collapsedMicDetail;
    // const peelableMics = this.state.viewInfo ? styles.collapsedMics : styles.mics;
    let print = [];
    if (this.state.currentMic) {
      print = ['x'];
    }
    return (
      <div>
        <div className={styles.component}>
          {/* Mic Table */}
          <div className={styles.mics}>
            <table>
              <tr>
                <th>
                  <span className={styles.locationMic}>MAIN TELESCOPE</span>
                </th>
                <th>
                  <span className={styles.headers}> MIC STATUS </span>
                </th>
                <th>
                  <span className={styles.headers}>NOTIFICATIONS</span>
                </th>
                <th>
                  <span className={styles.headers}>ALARM</span>
                </th>
              </tr>
              <Microphone
                source={RADIOSLINK.futuro}
                show={false}
                id={'mic1'}
                selectMic={(mic) => this.selectMic(mic)}
                ledsFunction={(vol) => this.leds(vol)}
              ></Microphone>
              <Microphone
                source={RADIOSLINK.biobio}
                show={false}
                id={'mic2'}
                selectMic={(mic) => this.selectMic(mic)}
                ledsFunction={(vol) => this.leds(vol)}
              ></Microphone>
            </table>
          </div>

          {/* Mic Detail peelable */}
          <div className={peelableDetail}>
            {/* HOLAAAAAAAAAAAAA */}
            <div className={styles.divDetails}>
              <div className={styles.listTitleWrapper}>
                <div
                  className={styles.collapseScriptListButton}
                  onClick={this.closeMicDetails}
                  title="Close available script list"
                >
                  <span style={{ width: '100%' }}>&#8854;</span>
                </div>
              </div>

              {print.map((value) => {
                const { audioContext, masterGain, audioRecorder, song, buffers, id } = this.state.currentMic ?? {};
                return (
                  <>
                    <div>
                      <div>
                        <input
                          onChange={() => {
                            if (masterGain) masterGain.gain.value = this.changeVolume('volume');
                          }}
                          type="range"
                          id="volume"
                          min="0"
                          max="2"
                          step="0.2"
                          value={masterGain?.gain?.value}
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (this.state.currentMic) {
                            if (!this.state.play) {
                              audioContext.resume();
                              song.play();
                              this.setState({ play: true });
                            } else {
                              masterGain.gain.value = 0;
                              this.setState({ play: false });
                            }
                          }
                        }}
                      >
                        Play Radio / Muted
                      </button>

                      <button
                        onClick={() => {
                          if (this.state.currentMic) {
                            this.record(audioContext, audioRecorder, buffers, id);
                          }
                        }}
                      >
                        Record
                      </button>
                    </div>

                    <div id="downloads" className={styles.records}>
                      <p> GRABACION:</p>
                      {this.state.records.map((rec) => {
                        return <Record url={rec.url} nameFile={rec.nameFile}></Record>;
                      })}
                    </div>

                    <div className={styles.container}>
                      <span>Microphone</span>
                      <div className={styles.volumenWrapper}>
                        <div id={'led'} className={styles.led}></div>
                        <div id={'led'} className={styles.led}></div>
                        <div id={'led'} className={styles.led}></div>
                        <div id={'led'} className={styles.led}></div>
                        <div id={'led'} className={styles.led}></div>

                        <div id={'led'} className={styles.led}></div>
                        <div id={'led'} className={styles.led}></div>
                        <div id={'led'} className={styles.led}></div>
                        <div id={'led'} className={styles.led}></div>
                        <div id={'led'} className={styles.led}></div>
                      </div>
                    </div>
                  </>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );

    /*
    return (
      <>
        <div className={styles.component}> 
            <div className={styles.mics}>
                <table className={styles.table}>
                    <tr className={styles.headTable}>
                        <th><h2>MAIN TELESCOPE</h2></th>
                        <th><p>MIC STATUS</p></th>
                        <th><p>NOTIFICATIONS</p></th>
                        <th><p>ALARM</p></th>
                    </tr>
                    <Microphone source={RADIOSLINK.futuro} show={false} id={'mic1'} 
                    selectMic = {(mic) => this.selectMic(mic) } ledsFunction = {(vol) => this.leds(vol)} ></Microphone>
                    <Microphone source={RADIOSLINK.biobio} show={false} id={'mic2'} 
                    selectMic = {(mic) => this.selectMic(mic)} ledsFunction = {(vol) => this.leds(vol)}></Microphone>
                </table>
            
            </div>
            <div className={[styles.collapsableScriptList, finishedScriptListClass].join(' ')}>
                <div className={[styles.finishedScriptList, styles.scriptList].join(' ')}>
                <div
                    className={[styles.collapsedScriptListLabelWrapper].join(' ')}
                    onClick={this.openFinishedList}
                    title="Open finished script list"
                >
                    <div className={[styles.collapsedScriptListLabel].join(' ')}>&#8853;</div>
                </div>

                <div className={styles.collapsableScriptListContent}>
                    <div className={styles.divDetails}>
                        <div className={styles.listTitleWrapper}>
                            <div
                                className={styles.collapseScriptListButton}
                                onClick={this.closeMicDetails}
                                title="Close available script list"
                            >
                                <span style={{ width: '100%' }}>&#8854;</span>
                            </div>
                        </div>
                    
                    {print.map((value)=> {
                        const {audioContext, masterGain, audioRecorder, song, buffers, id} = this.state.currentMic ?? {};
                        return (
                            <>
                        <div>
                        <div>
                            <input
                            onChange={() => {
                                if(masterGain) masterGain.gain.value = this.changeVolume('volume');
                            }}
                            type="range"
                            id='volume'
                            min="0"
                            max="2"
                            step="0.2"
                            value={masterGain?.gain?.value}
                            />
                        </div>
                        <button
                            onClick={() => {
                              if(this.state.currentMic){
                                if (!this.state.play) {
                                    audioContext.resume();
                                    song.play();
                                    this.setState({ play: true });
                                } else {
                                    masterGain.gain.value = 0;
                                    this.setState({ play: false });
                                }
                            }}}
                        >
                            Play Radio / Muted
                        </button>

                        <button
                            onClick={() => {
                                if(this.state.currentMic){
                                    this.record(audioContext,audioRecorder,buffers, id);
                                }
                            }}
                        >
                            Record
                        </button>

                    </div>

                    <div id='downloads' className={styles.records}>
                    <p> GRABACION:</p>
                    {this.state.records.map((rec)=>{
                        return(
                            <Record url={rec.url} nameFile={rec.nameFile}></Record>
                        );
                    })}
                    </div>

                    <div className={styles.container}>
                        <span>Microphone</span>
                        <div className={styles.volumenWrapper}>
                            <div id={"led"} className={styles.led}></div>
                            <div id={"led"} className={styles.led}></div>
                            <div id={"led"} className={styles.led}></div>
                            <div id={"led"} className={styles.led}></div>
                            <div id={"led"} className={styles.led}></div>

                            <div id={"led"} className={styles.led}></div>
                            <div id={"led"} className={styles.led}></div>
                            <div id={"led"} className={styles.led}></div>
                            <div id={"led"} className={styles.led}></div>
                            <div id={"led"} className={styles.led}></div>
                        </div>
                    </div>
                    </>
                        );
                    })}
                    </div>

                    </div>
                </div>
            </div>
        </div>
      </>
    );*/
  }
}
