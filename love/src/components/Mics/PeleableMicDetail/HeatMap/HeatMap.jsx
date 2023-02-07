import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { VegaLite } from 'react-vega';
import styles from './HeatMap.module.css';
import Button from 'components/GeneralPurpose/Button/Button';
import Input from 'components/GeneralPurpose/Input/Input';

export default class HeatMap extends Component {
  static propTypes = {
    /**
     * Info of the current mic to plot
     */
    infoPlot: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      infoPlot: null,
    };
  }

  componentDidMount = () => {};

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
      spec3D,
      data3D,
    } = this.props.infoPlot;
    console.log(showInput);
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
        <div className={styles.monserratFontTitle}> ALARM STORY</div>
        <div className={styles.divVegaLite}>
          <br></br>
          <VegaLite style={{ display: 'flex' }} renderer="svg" spec={spec3D} data={data3D} />
          <br></br>
        </div>
      </div>
    );
  }
}
