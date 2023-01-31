import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ManagerInterface, { parseCommanderData } from 'Utils';
import styles from './Microphone.module.css';
import Microphone from './Microphone';
import Button from 'components/GeneralPurpose/Button/Button';
import Record from './Record';
import { ReactComponent as StartRec } from './SVG/start_recording.svg';
import { ReactComponent as StopRec } from './SVG/stop_recording.svg';
import { ReactComponent as Play } from './SVG/play.svg';
import { ReactComponent as Pause } from './SVG/pause.svg';

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

      /* List of Mics with the respective id, src and location*/
      mics: [],

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

  componentDidMount = () => {
    let mic1 = { id: 'Microphone 1', loc: 'mainTelescope', src: RADIOSLINK.biobio };
    let mic2 = { id: 'Microphone 2', loc: 'mainTelescope', src: RADIOSLINK.carolina };
    let mic3 = { id: 'Microphone 3', loc: 'auxilaryTelescope', src: RADIOSLINK.futuro };
    let mic4 = { id: 'Microphone 4', loc: 'auxilaryTelescope', src: RADIOSLINK.corazon };
    let mic5 = { id: 'Microphone 5', loc: 'summitFacility', src: RADIOSLINK.adn };
    let mic6 = { id: 'Microphone 6', loc: 'summitFacility', src: RADIOSLINK.biobio };

    const mics = [mic1, mic2, mic3, mic4, mic5, mic6];

    this.setState({ mics: mics });
  };

  componentDidUpdate = (prevProps, prevState) => {
    // if(this.state.currentMic !== prevState.currentMic){
    //     const {vMeter} = this.state.currentMic;
    //     console.log(vMeter);
    //     vMeter.port.start();
    // }
  };

  selectMic = (mic) => {
    if (this.state.currentMic) {
      let { id } = this.state.currentMic;
      this.closeMicDetails();
      if (id === mic.id) return;
    }
    this.setState({ currentMic: mic, viewInfo: true });
    mic.selectMe();
  };

  openFinishedList = () => {
    this.setState({
      viewInfo: true,
    });
  };

  closeMicDetails = () => {
    console.log('closed');
    if (this.state.isRecording) this.record();
    if (this.state.play) this.play();
    this.state.currentMic.selectMe();
    this.setState({ viewInfo: false, currentMic: null });
  };

  record = () => {
    if (!this.state.currentMic) return;

    const { isRecording } = this.state;
    this.setState({ isRecording: !isRecording });
    this.state.currentMic?.recordFunc();
  };

  recordPush = (id, currentTime, url, blob) => {
    const newRecord = (prevRecords) => {
      prevRecords.push({ nameFile: id + currentTime.toString() + '.wav', url: url, blob: blob });
      return { records: prevRecords };
    };
    this.setState((prevState) => newRecord(prevState.records));
  };

  play = () => {
    if (!this.state.currentMic) return;

    const { play } = this.state;
    this.setState({ play: !play });
    this.state.currentMic.playFunc();
  };

  setVolume = () => {
    if (!this.state.currentMic) return;
    const volumeControl = document.getElementById('volume');
    this.state.currentMic.volumeFunc(volumeControl.value);
  };

  render() {
    const peelableDetail = this.state.viewInfo ? styles.micDetails : styles.collapsedMicDetail;
    const svgRec = this.state.isRecording ? (
      <StopRec className={[styles.recSVG, styles.verticalSpace].join(' ')}></StopRec>
    ) : (
      <StartRec className={[styles.recSVG, styles.verticalSpace].join(' ')}></StartRec>
    );
    const svgPLay = this.state.play ? (
      <Pause className={[styles.playSVG, styles.verticalSpace].join(' ')}></Pause>
    ) : (
      <Play className={[styles.playSVG, styles.verticalSpace].join(' ')}></Play>
    );
    let { volume } = this.state.currentMic ?? {};
    let textPlay = this.state.play ? 'PAUSE' : 'PLAY';
    let textRec = this.state.isRecording ? 'STOP REC' : 'START REC';
    return (
      <div>
        <div className={styles.component}>
          {/* Mic Table */}
          <div className={styles.mics}>
            <div className={styles.divTitleSection}>
              <span className={styles.locationMic}> AVAILABLE MICROPHONES</span>
            </div>
            <table>
              <colgroup span="2" />
              <col />
              <col />
              <col />
              <tr>
                <th colSpan="2" scope="colgroup" className={styles.thLocMic}>
                  <span className={styles.locationMic}>MAIN TELESCOPE</span>
                </th>

                <th scope="col">
                  <span className={styles.headers}> MIC STATUS </span>
                </th>
                <th scope="col">
                  <span className={styles.headers}>NOTIFICATIONS</span>
                </th>
                <th scope="col">
                  <span className={styles.headers}>ALARM</span>
                </th>
              </tr>
              {this.state.mics.map((m) => {
                if (m.loc === 'mainTelescope') {
                  return (
                    <>
                      <Microphone
                        source={m.src}
                        id={m.id}
                        selectMic={(mic) => this.selectMic(mic)}
                        recordPush={(id, currentTime, url, blob) => this.recordPush(id, currentTime, url, blob)}
                      ></Microphone>
                    </>
                  );
                }
              })}

              <br />

              <colgroup span="2" />
              <col />
              <col />
              <col />
              <tr>
                <th colSpan="2" scope="colgroup" className={styles.thLocMic}>
                  <span className={styles.locationMic}>AUXIALARY TELESCOPE</span>
                </th>

                <th scope="col">
                  <span className={styles.headers}> MIC STATUS </span>
                </th>
                <th scope="col">
                  <span className={styles.headers}>NOTIFICATIONS</span>
                </th>
                <th scope="col">
                  <span className={styles.headers}>ALARM</span>
                </th>
              </tr>
              {this.state.mics.map((m) => {
                if (m.loc === 'auxilaryTelescope') {
                  return (
                    <Microphone
                      source={m.src}
                      id={m.id}
                      selectMic={(mic) => this.selectMic(mic)}
                      recordPush={(id, currentTime, url, blob) => this.recordPush(id, currentTime, url, blob)}
                    ></Microphone>
                  );
                }
              })}

              <br />

              <colgroup span="2" />
              <col />
              <col />
              <col />
              <tr>
                <th colSpan="2" scope="colgroup" className={styles.thLocMic}>
                  <span className={styles.locationMic}>SUMMIT FACILITY</span>
                </th>

                <th scope="col">
                  <span className={styles.headers}> MIC STATUS </span>
                </th>
                <th scope="col">
                  <span className={styles.headers}>NOTIFICATIONS</span>
                </th>
                <th scope="col">
                  <span className={styles.headers}>ALARM</span>
                </th>
              </tr>
              {this.state.mics.map((m) => {
                if (m.loc === 'summitFacility') {
                  return (
                    <Microphone
                      source={m.src}
                      id={m.id}
                      selectMic={(mic) => this.selectMic(mic)}
                      recordPush={(id, currentTime, url, blob) => this.recordPush(id, currentTime, url, blob)}
                    ></Microphone>
                  );
                }
              })}
            </table>
          </div>

          {/* Mic Detail peelable */}
          <div className={peelableDetail}>
            <div className={styles.divTitleSection}>
              <span className={styles.spanIdDetails}> {this.state.currentMic?.id}</span>
            </div>
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

              <div>PLOT</div>
              <div className={styles.audioStream}>
                <span className={[styles.detailsTitle, styles.headers].join(' ')}>AUDIO STREAMING</span>
                <div className={styles.aStreamContent}>
                  <span onClick={() => this.play()} className={styles.recSpan}>
                    {svgPLay}
                    <br />
                    <span className={styles.oneLine}>{textPlay}</span>
                  </span>
                  <input
                    onChange={() => this.setVolume()}
                    type="range"
                    id="volume"
                    min="0"
                    max="2"
                    step="0.1"
                    value={volume?.value}
                  />
                  <span
                    className={styles.recSpan}
                    onClick={() => {
                      this.record();
                    }}
                  >
                    {svgRec}
                    <br />
                    <span className={styles.oneLine}>{textRec}</span>
                  </span>
                </div>

                <span className={[styles.detailsTitle, styles.headers].join(' ')}>RECORDED AUDIOS</span>
                <div id="downloads" className={styles.recordsDiv}>
                  {this.state.records.map((rec) => {
                    return <Record url={rec.url} nameFile={rec.nameFile} blob={rec.blob}></Record>;
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
