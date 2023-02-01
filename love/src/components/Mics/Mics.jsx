import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './Microphone.module.css';
// import styles2 from './palette2.css'
import { ReactComponent as StartRec } from './SVG/start_recording.svg';
import { ReactComponent as StopRec } from './SVG/stop_recording.svg';
import { ReactComponent as Play } from './SVG/play.svg';
import { ReactComponent as Pause } from './SVG/pause.svg';
import PeleableMicDetail from './PeleableMicDetail/PeleableMicDetail';
import Table from './Table/Table';
import ManagerInterface from 'Utils';

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

  // //THEME FUNCTION PRUEBAS.. LUEGO QUITAR
  // changeTheme = () => {
  //   import('./palette2.css').then(console.log('LIGHT THEME'));
  //   ManagerInterface.setStyle("LIGHT");
  // }

  //Functions to microphone. /////

  componentDidMount = () => {
    // const theme = ManagerInterface.getStyle();
    // if(theme=== 'LIGHT'){
    //   import('./palette2.css').then(console.log('LIGHT THEME'));
    // }

    let mic1 = { id: 'Microphone 1', loc: 'mainTelescope', src: RADIOSLINK.biobio };
    let mic2 = { id: 'Microphone 2', loc: 'mainTelescope', src: RADIOSLINK.carolina };
    let mic3 = { id: 'Microphone 3', loc: 'auxilaryTelescope', src: RADIOSLINK.futuro };
    let mic4 = { id: 'Microphone 4', loc: 'auxilaryTelescope', src: RADIOSLINK.corazon };
    let mic5 = { id: 'Microphone 5', loc: 'summitFacility', src: RADIOSLINK.adn };
    let mic6 = { id: 'Microphone 6', loc: 'summitFacility', src: RADIOSLINK.biobio };

    const mics = [mic1, mic2, mic3, mic4, mic5, mic6];

    this.setState({ mics: mics });
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

  setVolume = (value) => {
    if (!this.state.currentMic) return;
    this.state.currentMic.volumeFunc(value);
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
              <span className={styles.spanMicAvailable}> AVAILABLE MICROPHONES</span>
            </div>
            <Table mics={this.state.mics} selectMic={this.selectMic} recordPush={this.recordPush}></Table>
            {/* <table>
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
            </table> */}
          </div>

          <PeleableMicDetail
            peelableDetailCss={peelableDetail}
            currentMic={this.state.currentMic}
            closeMicDetails={this.closeMicDetails}
            play={this.play}
            setVolume={this.setVolume}
            volume={volume}
            isPlay={this.state.play}
            record={this.record}
            records={this.state.records}
            svgPLay={svgPLay}
            svgRec={svgRec}
            textPlay={textPlay}
            textRec={textRec}
          ></PeleableMicDetail>
        </div>

        {/* THEME... LUEGO QUITAR  */}
        {/* <div>
          <button onClick={async () => this.changeTheme()}>Change Theme</button>
        </div> */}
      </div>
    );
  }
}
