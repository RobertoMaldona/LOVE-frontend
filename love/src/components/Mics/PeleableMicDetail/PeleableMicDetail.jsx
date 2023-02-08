import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './PeleableMicDetail.module.css';
import Slider from 'components/GeneralPurpose/Slider/Slider';
import Record from './Record';
import HeatMap from './HeatMap/HeatMap';

export default class PeleableMicDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      first: true,

      second: false,
    };

    this.containerRef = React.createRef();
  }

  static propTypes = {
    /**
     * ID of the current mic selected
     */
    id: PropTypes.string,
    /**
     * Plot's info of the current mic to render
     */
    infoPlot: PropTypes.object,
    /**
     * Function that allows to set the heat map container node of the current mic to render
     */
    setContainerNode: PropTypes.func,
    /**
     * Classname of the styles to decide if show or don't
     */
    peelableDetailCss: PropTypes.string,
    /**
     * Function to close this component peleable
     */
    closeMicDetails: PropTypes.func,
    /**
     * Function to play or pause the selected mic
     */
    play: PropTypes.func,
    /**
     * Function to set the volume of the current mic playing
     */
    setVolume: PropTypes.func,
    /**
     * The initial volume of the mic
     */
    volume: PropTypes.object,
    /**
     * State that say if there is some mic playing
     */
    isPlay: PropTypes.bool,
    /**
     * Function to start or stop record
     */
    record: PropTypes.func,
    /**
     * Array of records made previously
     */
    records: PropTypes.array,
    /**
     * Svg of play. This change if the mic is playing
     */
    svgPLay: PropTypes.object,
    /**
     * Svg of start record. This change if the mic is recording
     */
    svgRec: PropTypes.element,
    /**
     * Text down of svgPLay
     */
    textPlay: PropTypes.string,
    /**
     * Text down of svgRec
     */
    textRec: PropTypes.string,
  };

  /**
   * Function that allows to update the heat map container node.
   * @param {Object} container
   */
  changeSize = (container) => {
    this.props.setContainerNode(container);
    this.setState({ first: false });
    if (!this.state.second) {
      this.setState({ second: true });
      console.log('TRUE');
    } else {
      this.setState({ second: false });
      console.log('FALSE');
    }
  };

  componentDidMount = () => {};

  render() {
    const {
      id,
      peelableDetailCss,
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
      containerNode,
    } = this.props;

    return (
      <div className={peelableDetailCss}>
        <div className={styles.divTitleSection}>
          <span className={styles.spanIdDetails}> {id ?? ''}</span>
        </div>

        <div className={styles.divDetails}>
          <div>
            {!containerNode ? (
              <div ref={this.containerRef} id="el de verda">
                {this.state.first ? this.changeSize(this.containerRef.current?.parentNode) : <></>}
                {this.state.second ? this.changeSize(this.containerRef.current?.parentNode) : <></>}
                <HeatMap infoPlot={this.props.infoPlot} containerNode={this.containerRef}></HeatMap>
              </div>
            ) : (
              <div>
                <HeatMap infoPlot={this.props.infoPlot} containerNode={containerNode}></HeatMap>
              </div>
            )}
          </div>
          <div className={styles.audioStream}>
            <span className={[styles.detailsTitle, styles.headers].join(' ')}>AUDIO STREAMING</span>
            <div className={styles.aStreamContent}>
              <span onClick={() => play()} className={styles.recSpan}>
                {svgPLay}
                <br />
                <span className={styles.oneLine}>{textPlay}</span>
              </span>
              <div>
                <Slider
                  onChange={(value) => setVolume(value)}
                  max={2}
                  value={volume?.value}
                  disabled={!isPlay}
                ></Slider>
                <span className={styles.oneLine}>VOLUME</span>
              </div>
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
            {/* Aqui iba records */}
          </div>
          <span className={[styles.detailsTitle, styles.headers].join(' ')}>RECORDED AUDIOS</span>
          <div id="downloads" className={styles.recordsDiv}>
            {records.map((rec) => {
              return <Record url={rec.url} nameFile={rec.nameFile} blob={rec.blob}></Record>;
            })}
          </div>
        </div>
      </div>
    );
  }
}
