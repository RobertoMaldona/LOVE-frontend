import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './FlightTracker.module.css';
import MapFlightTracker from './MapFlightTracker';
import SummaryPanel from '../GeneralPurpose/SummaryPanel/SummaryPanel';
import Row from '../GeneralPurpose/SummaryPanel/Row';
import Label from '../GeneralPurpose/SummaryPanel/Label';
import Value from '../GeneralPurpose/SummaryPanel/Value';
import Title from '../GeneralPurpose/SummaryPanel/Title';
import StatusText from '../GeneralPurpose/StatusText/StatusText';
import isEqual from 'lodash';
import time from 'redux/reducers/time';
import SimpleTable from 'components/GeneralPurpose/SimpleTable/SimpleTable';
import ManagerInterface, { calculateTimeoutToNow, formatSecondsToDigital } from 'Utils';

const DEFAULT_POLLING_TIMEOUT = 5000;
export default class FlightTracker extends Component {
  constructor(props) {
    super(props);
    this.pollingInterval = null;
    this.countPollingIterval = null;
    this.state = {
      timers: {
        LAN54: 100,
        2: 15,
        m547: 600,
      },
      planes: [],
      lastUpdate: 0,
    };
  }

  planeInRadio = (position, radio) => {
    const xc = 10;
    const yc = 10;
    const d2 = (position[0] - xc) ** 2 + (position[1] - yc) ** 2;
    const d = Math.sqrt(d2);
    return d <= radio;
  };

  componentDidUpdate = (prevProps, prevState) => {
    const RADIO = 10;
    if (!isEqual(prevState.planes, this.state.planes)) {
      this.state.planes.map((value) => {
        if (this.planeInRadio(value.position, RADIO)) {
          if (this.state.timers[value.id] === undefined) {
            this.setState((prevState) => ({ ...prevState.timers, [value.id]: 600 }));
          }
        } else {
          if (prevState.timers[value.id] != undefined) {
            const copyTimers = { ...this.state.timers };
            delete copyTimers[value.id];
            this.setState({ timers: copyTimers });
          }
        }
      });
    }
  };

  componentDidMount = () => {
    //Timer
    if (this.countPollingIterval) clearInterval(this.countPollingIterval);
    this.countPollingIterval = setInterval(() => {
      this.setState((prevState) => this.changeStateTimer(prevState.timers));
    }, 1000);

    //Get Planes's data from API
    ManagerInterface.getDataFlightTracker('(-30.2326, -70.7312)', '200').then((res) => {
      this.setState({
        planes: res,
        lastUpdate: Date.now(),
      });
    });

    if (this.pollingInterval) clearInterval(this.pollingInterva);
    this.pollingInterval = setInterval(
      () => {
        ManagerInterface.getDataFlightTracker('(-30.2326, -70.7312)', '200').then((res) => {
          this.setState({
            planes: res,
            lastUpdate: Date.now(),
          });
        });
      },
      this.props.pollingTimeout ? this.props.pollingTimeout * 1000 : DEFAULT_POLLING_TIMEOUT,
    );
  };

  /*
    Returns a new Dictionary of timers, to change in setState
  */
  changeStateTimer(timers) {
    const newTimers = timers;
    for (const [key, value] of Object.entries(newTimers)) {
      if (value == 0) {
        delete newTimers[key];
      } else {
        newTimers[key] = value - 1;
      }
    }
    return newTimers;
  }

  componentWillUnmount = () => {
    // this.props.unsubscribeToStream();
  };

  render() {
    console.log(this.state.planes);
    const headers = [
      {
        field: 'id',
        title: 'AirCraft ID',
        type: 'string',
      },
      {
        field: 'time',
        title: 'Approach timer',
        type: 'number',
        className: styles.statusColumn,
        render: (value) => {
          let timerStatus = 'ok';
          if (value < 600 && value > 300) {
            timerStatus = 'warning';
          }
          if (value <= 300) {
            timerStatus = 'alert';
          }
          return (
            <StatusText small status={timerStatus}>
              {formatSecondsToDigital(value)}
            </StatusText>
          );
        },
      },
      {
        field: 'latitude',
        title: 'Latitude',
      },
      {
        field: 'longituded',
        title: 'Longituded',
      },
      {
        field: 'trajectory',
        title: 'Trajectory',
      },
      {
        field: 'velocity',
        title: 'velocity',
        type: 'string',
      },
    ];
    const planes = [
      {
        id: 'LAN54',
        latitude: '28.4545454',
        longituded: '28.4545454',
        trajectory: '28.4545454',
        velocity: '450mph',
      },
      {
        id: 'IBERIA3',
        latitude: '28.4545454',
        longituded: '28.4545454',
        trajectory: '28.4545454',
        velocity: '450mph',
      },
    ];
    // const { planes } = this.props ?? [];
    const tableData = [];
    planes.forEach((element) => {
      let copy_element = element;
      copy_element['time'] = this.state.timers[element['id']] ?? 600;
      tableData.push(copy_element);
    });

    // const tableData = Object.values(data);

    return (
      <div className={styles.container}>
        {/* <MapFlightTracker planes={[]}></MapFlightTracker> */}
        <div className={styles.statusDiv}>
          <Title>Monitoring status</Title>
          <Value>
            <StatusText title={'Monitoring status'} status={'running'} small>
              {'Connected'}
            </StatusText>
          </Value>
        </div>

        <SimpleTable headers={headers} data={tableData}></SimpleTable>
      </div>
    );
  }
}
