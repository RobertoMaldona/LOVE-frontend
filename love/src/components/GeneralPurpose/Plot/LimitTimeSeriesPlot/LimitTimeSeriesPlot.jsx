import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/GeneralPurpose//Button/Button';
import Input from 'components/GeneralPurpose//Input/Input';
import styles from './LimitTimeSeriesPlot.module.css';
import { VegaLite } from 'react-vega';
import { DateTime } from 'luxon';
import moment from 'moment';
import _ from 'lodash';

export default class LimitTimeSeriesPlot extends Component {
  static propTypes = {
    // /** Width of the plot in pixels */
    // width: PropTypes.number,

    // /** Height of the plot in pixels */
    // height: PropTypes.number,

    /** Node to be used to track width and height.
     *  Use this instead of props.width and props.height for responsive plots.
     *  Will be ignored if both props.width and props.height are provided */
    containerNode: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.state = {
      width: undefined,

      height: undefined,

      containerWidth: 500,

      containerHeight: 200,

      actualValue: 0.5,

      initialTime: '',

      Limit: 0.1,

      timeArray: [],

      spec: {},

      data: { table: [] },

      showInput: false,
    };

    this.resizeObserver = undefined;
  }

  /**
   *
   */
  initVariables() {
    this.width = 500;
    this.height = 200;
    this.intervalTime = 1000; //ms.
    this.titleX = 'Time';
    this.titleY = 'Values';
    this.legendValue = 'Actual Value';
    this.legendLimit = 'Limit';
    this.domainY = [-0.1, 1];
    this.titlePlot = 'Limit Time Series Plot';

    this.countPollingIterval;
  }

  /**
   *
   */
  componentDidMount = () => {
    this.initVariables();
    if (this.countPollingIterval) clearInterval(this.countPollingIterval);
    this.countPollingIterval = setInterval(() => {
      this.setState((prevState) => this.getvalueData(prevState, this.getTime()));
    }, this.intervalTime);
  };

  componentDidUpdate = (prevProps) => {
    console.log(this.props.containerNode);
    if (prevProps.containerNode !== this.props.containerNode) {
      if (this.props.containerNode) {
        this.resizeObserver = new ResizeObserver((entries) => {
          console.log('resize');
          const container = entries[0];
          this.setState({
            height: container.contentRect.height - 50,
            width: container.contentRect.width - 50,
          });
        });

        this.resizeObserver.observe(this.props.containerNode);
      }
    }
  };

  componentWillUnmount = () => {
    // this.props.unsubscribeToStreams();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  };

  /**
   *
   * @param {*} prev
   * @param {*} actTime
   * @returns
   */
  getvalueData = (prev, actTime) => {
    if (!prev.data.table) {
      return {};
    }

    let dataCopy = { table: [] };
    dataCopy.table = prev.data.table;

    let newTimeArray;
    newTimeArray = this.state.timeArray;
    newTimeArray.push(actTime);
    this.setState({ timeArray: newTimeArray });

    let newInitialTime;

    if (this.state.timeArray.length === 1) {
      this.setState({ initialTime: actTime });
      newInitialTime = actTime;
    }

    // Here we insert the data that we want to show every second.
    let value = this.state.actualValue;

    dataCopy.table.push({ t: actTime, value: value, Limit: this.state.Limit });

    if (this.state.timeArray.length === 6) {
      dataCopy.table.shift();
      newTimeArray.shift();
      this.setState({ timeArray: newTimeArray });
      newInitialTime = newTimeArray[0];
    }

    const result = {
      spec: {
        // width: this.width,
        // height: this.height,
        width:
          this.state.width !== undefined && this.state.height !== undefined
            ? this.state.width
            : this.state.containerWidth,
        height:
          this.state.width !== undefined && this.state.height !== undefined
            ? this.state.height
            : this.state.containerHeight,
        autosize: {
          type: 'fit',
          contains: 'padding',
        },
        encoding: {
          x: { type: 'temporal' },
          y: { type: 'quantitative' },
          color: {
            type: 'nominal',
            scale: { domain: [this.legendValue, this.legendLimit], range: ['#3E707B', '#F0E400'] },
          },
        },
        layer: [
          {
            mark: { type: 'point', color: '#3E707B', strokeWidth: 5 },
            encoding: {
              x: {
                field: 't',
                type: 'temporal',
                axis: { title: this.titleX, format: '%H:%M:%S' },
                scale: { domain: [newInitialTime, actTime] },
              },
              y: {
                field: 'value',
                type: 'quantitative',
                axis: { title: this.titleY },
                scale: { domain: this.domainY },
              },
              color: {
                datum: this.legendValue,
                condition: { test: `datum.value > ${this.state.Limit}`, value: '#F0E400' },
              },
            },
          },
          {
            mark: { type: 'line', color: '#F0E400', strokeWidth: 0.5, strokeDash: 8.8 },
            encoding: {
              x: {
                field: 't',
                type: 'temporal',
                axis: { title: 'Time', format: '%H:%M:%S' },
                scale: { domain: [newInitialTime, actTime] },
              },
              y: {
                field: 'Limit',
                type: 'quantitative',
              },
              color: {
                datum: this.legendLimit,
              },
            },
          },
        ],

        data: { name: 'table' },
        background: '#1A2D37',
        autosize: { resize: 'true' },
        view: { fill: '#111F27', stroke: '#111F27', cornerRadius: 10, stroke: '#2B3F4A', strokeWidth: 10 },
        padding: { left: 15, top: 15, right: 15, bottom: 15 },
        title: { text: this.titlePlot, color: '#C1CED2', fontSize: 15 },
        config: {
          axis: {
            titleColor: '#C1CED2',
            titleFontSize: 15,
            titleFontWeight: 'bold',
            titlePadding: 10,
            tickCount: 5,
            tickSize: 8,
            labelColor: '#C1CED2',
            labelFontSize: 12,
            labelPadding: 5,
            gridColor: '#C0CDD1',
            gridOpacity: 0.1,
          },
          legend: { labelColor: '#C1CED2', labelFontSize: 15, symbolStrokeWidth: 7, symbolSize: 10 },
        },
      },
      data: dataCopy,
    };

    return result;
  };

  /**
   *
   */
  appearInputvalueLimit() {
    if (this.state.showInput) {
      this.setState({ showInput: false });
    } else {
      this.setState({ showInput: true });
    }
  }

  returnInput() {
    if (this.state.showInput) {
      return <Input onChange={(e) => this.setState({ Limit: e.target.value })} />;
    } else {
      return this.state.Limit;
    }
  }

  /**
   *
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
   */
  obtainNextTimeInSeconds(actTime) {
    const date = moment(actTime).add(1, 'seconds');
    return new Date(date.utc()._d).toISOString().substring(0, 19);
  }

  render() {
    console.log(this.state.width, this.state.height);
    return (
      <>
        <div className={styles.container0}>
          <div className={styles.container1}>
            <div className={styles.flexStyle}>
              <div>{this.legendValue} </div>
              <div className={styles.LiveValue}> {this.state.actualValue} </div>
            </div>

            <div className={styles.flexStyle}>
              <div className={styles.lineButtonContainer}>
                {this.legendLimit}
                <Button
                  className={styles.buttonValueLimit}
                  onClick={() => {
                    this.appearInputvalueLimit();
                  }}
                >
                  <div className={styles.svgButton}>
                    <svg width="1rem" height="1rem">
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

              <div> {this.returnInput()}</div>
            </div>
          </div>

          <br></br>

          <div>
            <VegaLite style={{ display: 'flex' }} renderer="svg" spec={this.state.spec} data={this.state.data} />
          </div>
        </div>
      </>
    );
  }
}
