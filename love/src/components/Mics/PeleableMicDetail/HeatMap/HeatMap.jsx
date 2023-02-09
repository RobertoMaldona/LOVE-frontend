import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { VegaLite } from 'react-vega';
import styles from './HeatMap.module.css';
import Button from 'components/GeneralPurpose/Button/Button';
import Input from 'components/GeneralPurpose/Input/Input';
import { buffer, window } from 'd3';
import _ from 'lodash';

export default class HeatMap extends Component {
  static propTypes = {
    /**
     * Info of the current mic to plot
     */
    infoPlot: PropTypes.object,
    /** Node to be used to track width and height.
     *  Use this instead of props.width and props.height for responsive plots.
     */
    containerNode: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.state = {
      infoPlot: null,

      width: undefined,

      height: undefined,

      spec: {
        width: 100,
        height: 100,
        data: { name: 'table' },
        mark: { type: 'rect' },
        encoding: {
          x: { field: 't', type: 'temporal', axis: { title: 'TIME', format: '%H:%M:%S', grid: true } },
          y: {
            field: 'f',
            type: 'quantitative',
            axis: { title: 'FREQUENCY [Hz]', grid: true },
            scale: { domain: [0, this.bufferLength + 1] },
          },
          color: {
            type: 'quantitative',
            field: 'amp',
            scale: { scheme: 'spectral' },
            legend: { labelColor: '#ddd', labelFontSize: 14, titleColor: '#ddd', title: 'dB', gradientLength: 200 },
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
      showHeatMap: false,
    };

    this.resizeObserver = undefined;
  }

  /**
   *
   * @param {*} prevProps
   */
  componentDidUpdate = (prevProps) => {
    if (prevProps.containerNode !== this.props.containerNode) {
      if (this.props.containerNode) {
        this.resizeObserver = new ResizeObserver((entries) => {
          const container = entries[0];
          this.setState({
            height: container.contentRect.height - 198,
            width: container.contentRect.width - 120,
          });
        });

        this.resizeObserver.observe(this.props.containerNode);
      }
    }

    if (this.props.infoPlot !== null) {
      if (this.props.infoPlot.timeDomain !== undefined) {
        const { timeDomain, windowTimePlot, bufferLength } = this.props.infoPlot;
        const prevTimeDomain = prevProps.infoPlot?.timeDomain;
        if (timeDomain !== false) {
          if (prevTimeDomain !== timeDomain) {
            this.constructSpec(timeDomain, windowTimePlot, bufferLength);
          }
        }
      }
    }
  };

  /**
   * Function that update the spec inpu to Vega Lite Heat Map.
   * @param {Array} timeDomain, x-axis heat map.
   * @param {number} windowTimePlot, x-axis amount of elements.
   * @param {number} bufferLength, y-axis amount of elements.
   */
  constructSpec = (timeDomain, windowTimePlot, bufferLength) => {
    console.log('infoplot', timeDomain, windowTimePlot, bufferLength);
    const height = this.state.height;
    const width = this.state.width;
    console.log('size', width, height);
    const spec = {
      spec: {
        width: width,
        height: height,
        data: { name: 'table' },
        mark: { type: 'rect' },
        encoding: {
          x: {
            field: 't_min',
            type: 'temporal',
            axis: { title: 'TIME', format: '%H:%M:%S', tickCount: windowTimePlot - 1, grid: true },
            scale: { domain: timeDomain },
          },
          x2: {
            field: 't_max',
            type: 'temporal',
          },
          y: {
            field: 'f_min',
            type: 'quantitative',
            axis: { title: 'FREQUENCY [Hz]', grid: true, labels: true },
            scale: { domain: [0, bufferLength + 1] },
          },
          y2: { field: 'f_max', type: 'quantitative' },
          color: {
            type: 'quantitative',
            field: 'amp',
            scale: { scheme: 'spectral' },
            legend: { labelColor: '#ddd', labelFontSize: 10, titleColor: '#ddd', title: 'dB', gradientLength: height },
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
    };
    this.setState({ spec: spec.spec });
  };

  componentWillUnmount = () => {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  };

  /**
   * This function allows to show up the Heat Map, after press the show up button,
   * changing the correspondient state.
   */
  appearHeatMap = () => {
    if (this.state.showHeatMap) {
      this.setState({ showHeatMap: false });
    } else {
      this.setState({ showHeatMap: true });
    }
  };

  render() {
    if (!this.props.infoPlot) {
      return <></>;
    }

    const {
      actualFreq,
      actualDb,
      showInput,
      appearInputdBLimit,
      setDbLimitState,
      dbLimit,
      data3D,
    } = this.props.infoPlot;
    return (
      <div className={styles.infoMonserratFontContainer0}>
        <div className={styles.infoMonserratFontContainer1}>
          <div className={styles.infoMonserratFont1}>
            <div> Live values </div>
            <div className={styles.dBLiveValue}>
              {' '}
              {actualDb.toString().substring(0, 5)}dB in {actualFreq} Hz
            </div>
          </div>

          <div className={styles.infoMonserratFont2}>
            <div className={styles.buttondBLimit}>
              Limit
              <Button
                className={styles.editButtondBLimit}
                onClick={() => {
                  appearInputdBLimit();
                }}
              >
                <div className={styles.svgButton}>
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
                </div>
              </Button>
            </div>
            <div>{showInput ? <Input onChange={(e) => setDbLimitState(e.target.value)} /> : dbLimit}</div>
          </div>
        </div>
        <br></br>
        <div className={styles.monserratFontTitle}>
          ALARM STORY
          <Button
            className={styles.editButtonShowHeatMap}
            onClick={() => {
              this.appearHeatMap();
            }}
          >
            {this.state.showHeatMap ? 'Hide Spectrogram' : 'Show Spectrogram'}
          </Button>
        </div>

        <div className={styles.divVegaLite}>
          <div>
            {console.log(this.state.showHeatMap)}
            {this.state.showHeatMap ? (
              <VegaLite style={{ display: 'flex' }} renderer="svg" spec={this.state.spec} data={data3D} />
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    );
  }
}
