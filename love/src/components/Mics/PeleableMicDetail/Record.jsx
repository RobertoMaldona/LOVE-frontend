import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ManagerInterface from 'Utils';
import styles from './PeleableMicDetail.module.css';
import PlayIcon from 'components/icons/MICS/Play/PlayIcon';
import DownloadIcon from 'components/icons/MICS/Download/DownloadIcon';
import PauseIcon from 'components/icons/MICS/Pause/PauseIcon';

export default class Record extends Component {
  static propTypes = {
    /**
     * The url blob generated by the record
     */
    url: PropTypes.string,
    /**
     * The name file set to the record
     */
    nameFile: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      play: false,
    };
    this.aCtx;
    this.source;
    this.songSource;
    this.masterGain;
  }

  componentDidMount = () => {
    this.aCtx = new AudioContext();
    this.source = new Audio(this.props.url);
    this.songSource = this.aCtx.createMediaElementSource(this.source);
    this.masterGain = this.aCtx.createGain();
    this.masterGain.gain.value = 1;
    this.songSource.connect(this.masterGain);
    this.masterGain.connect(this.aCtx.destination);

    console.log(this.props.url);
  };

  /**
   * Function to play the record
   */
  play = () => {
    let { aCtx, source } = this;
    if (this.state.play) {
      source.pause();
      this.setState({ play: false });
    } else {
      aCtx.resume();
      source.play();
      this.setState({ play: true });
    }
  };

  /**
   * TESSSSST
   * Function Test to send the blob to the Backend
   * @param {*} blob
   */
  auxFunc = (blob) => {
    ManagerInterface.postBlob(blob);
    console.log(blob);
  };

  render() {
    const { url, nameFile, blob } = this.props;
    const svgPLay = this.state.play ? (
      <PauseIcon className={styles.playSVG}></PauseIcon>
    ) : (
      <PlayIcon className={styles.playSVG}></PlayIcon>
    );

    return (
      <div className={styles.records}>
        <span onClick={() => this.play()} className={[styles.recSpan, styles.marginBlock].join(' ')}>
          {svgPLay}
        </span>
        <span className={styles.spanNameFiles}>{nameFile}</span>
        <a onClick={() => this.auxFunc(blob)} href={url} download={nameFile} className={styles.download}>
          <DownloadIcon className={styles.downloadSvg}></DownloadIcon>
        </a>
      </div>
    );
  }
}
