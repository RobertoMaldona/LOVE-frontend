import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ManagerInterface from 'Utils';
import { ReactComponent as Play } from './SVG/play.svg';
import { ReactComponent as Pause } from './SVG/pause.svg';
import { ReactComponent as Download } from './SVG/download.svg';
import { source } from 'react-uid/dist/es5/context';
import styles from './Microphone.module.css';

export default class Record extends Component {
  static propTypes = {
    url: PropTypes.string,
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

  auxFunc = (blob) => {
    ManagerInterface.postBlob(blob);
    console.log(blob);
  };

  render() {
    const { url, nameFile, blob } = this.props;
    const svgPLay = this.state.play ? (
      <Pause className={styles.playSVG}></Pause>
    ) : (
      <Play className={styles.playSVG}></Play>
    );

    return (
      <div className={styles.records}>
        <span onClick={() => this.play()} className={[styles.recSpan, styles.marginBlock].join(' ')}>
          {svgPLay}
        </span>
        <span className={styles.spanNameFiles}>{nameFile}</span>
        <a onClick={() => this.auxFunc(blob)} href={url} download={nameFile} className={styles.download}>
          <Download className={styles.recSVG}></Download>
        </a>
      </div>
    );
  }
}
