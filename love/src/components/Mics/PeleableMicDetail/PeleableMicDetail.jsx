import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './PeleableMicDetail.module.css';
import Slider from 'components/GeneralPurpose/Slider/Slider';
import Record from './Record';
import HeatMap from './HeatMap/HeatMap';

export default class PeleableMicDetail extends Component {
  static propTypes = {
    currentMic: PropTypes.object,
    peelableDetailCss: PropTypes.string,
    closeMicDetails: PropTypes.func,
    play: PropTypes.func,
    setVolume: PropTypes.func,
    volume: PropTypes.object,
    isPlay: PropTypes.bool,
    record: PropTypes.func,
    records: PropTypes.array,
    svgPLay: PropTypes.object,
    svgRec: PropTypes.element,
    textPlay: PropTypes.string,
    textRec: PropTypes.string,
  };

  render() {
    const {
      currentMic,
      peelableDetailCss,
      closeMicDetails,
      play,
      setVolume,
      volume,
      isPlay,
      record,
      records,
      svgPLay,
      svgRec,
      textPlay,
      textRec,
    } = this.props;
    console.log(currentMic);
    let { actualFreq, actualDb, appearInputdBLimit, setDbLimitState, dbLimit, spec3D, data3D } = currentMic ?? {};

    return (
      <div className={peelableDetailCss}>
        <div className={styles.divTitleSection}>
          <span className={styles.spanIdDetails}> {currentMic?.id}</span>
        </div>

        <div className={styles.divDetails}>
          <div className={styles.listTitleWrapper}>
            <div
              className={styles.collapseScriptListButton}
              onClick={closeMicDetails}
              title="Close available script list"
            >
              <span style={{ width: '100%' }}>&#8854;</span>
            </div>
          </div>

          <div>
            <HeatMap
              actualFreq={actualFreq}
              actualDb={actualDb}
              appearInputdBLimit={appearInputdBLimit}
              setDbLimitState={setDbLimitState}
              dbLimit={dbLimit}
              spec3D={spec3D}
              data3D={data3D}
            ></HeatMap>
          </div>
          <div className={styles.audioStream}>
            <span className={[styles.detailsTitle, styles.headers].join(' ')}>AUDIO STREAMING</span>
            <div className={styles.aStreamContent}>
              <span onClick={() => play()} className={styles.recSpan}>
                {svgPLay}
                <br />
                <span className={styles.oneLine}>{textPlay}</span>
              </span>
              <Slider onChange={(value) => setVolume(value)} max={2} value={volume?.value} disabled={!isPlay}></Slider>
              <span
                className={styles.recSpan}
                onClick={() => {
                  record();
                }}
              >
                {svgRec}
                <br />
                <span className={styles.oneLine}>{textRec}</span>
              </span>
            </div>
            <span className={[styles.detailsTitle, styles.headers].join(' ')}>RECORDED AUDIOS</span>
            <div id="downloads" className={styles.recordsDiv}>
              {records.map((rec) => {
                return <Record url={rec.url} nameFile={rec.nameFile} blob={rec.blob}></Record>;
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
