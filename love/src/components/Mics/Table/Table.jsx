import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './Table.module.css';
import Microphone from './Microphone';

export default class Table extends Component {
  static propTypes = {
    mics: PropTypes.array,
    selectMic: PropTypes.func,
    recordPush: PropTypes.func,
    setInfoPlot: PropTypes.func,
  };

  render() {
    const { mics, selectMic, recordPush, setInfoPlot } = this.props;
    return (
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
        {mics.map((m) => {
          if (m.loc === 'mainTelescope') {
            return (
              <>
                <Microphone
                  source={m.src}
                  id={m.id}
                  selectMic={(mic) => selectMic(mic)}
                  recordPush={(id, currentTime, url, blob) => recordPush(id, currentTime, url, blob)}
                  setInfoPlot={(data) => setInfoPlot(data)}
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
        {mics.map((m) => {
          if (m.loc === 'auxilaryTelescope') {
            return (
              <Microphone
                source={m.src}
                id={m.id}
                selectMic={(mic) => selectMic(mic)}
                recordPush={(id, currentTime, url, blob) => recordPush(id, currentTime, url, blob)}
                setInfoPlot={(data) => setInfoPlot(data)}
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
        {mics.map((m) => {
          if (m.loc === 'summitFacility') {
            return (
              <Microphone
                source={m.src}
                id={m.id}
                selectMic={(mic) => selectMic(mic)}
                recordPush={(id, currentTime, url, blob) => recordPush(id, currentTime, url, blob)}
                setInfoPlot={(data) => setInfoPlot(data)}
              ></Microphone>
            );
          }
        })}
      </table>
    );
  }
}
