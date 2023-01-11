import React, { Component } from 'react';
import styles from './FlightTracker.module.css';
import MapFlightTracker from './MapFlightTracker';
import Value from '../GeneralPurpose/SummaryPanel/Value';
import Title from '../GeneralPurpose/SummaryPanel/Title';
import StatusText from '../GeneralPurpose/StatusText/StatusText';
import isEqual, { remove } from 'lodash';
import SimpleTable from 'components/GeneralPurpose/SimpleTable/SimpleTable';
import ManagerInterface, { formatSecondsToDigital } from 'Utils';
import { scaleDiverging } from 'd3';

const DEFAULT_POLLING_TIMEOUT = 5000;
export default class FlightTracker extends Component {
  constructor(props) {
    super(props);
    this.pollingInterval = null;
    this.countPollingIterval = null;
    this.state = {
      timers: {},
      planes: [],
      planesState: {},
      lastUpdate: 0,
    };
  }

  /**
   * @param {*} position: list with latitude and lonegitude
   * @param {*} radio: radio to explore
   * @returns boolean, true if the position is inside the radio
   */
  planeInRadio = (position, radio) => {
    const centralLatitude = 10;
    const centralLongitude = 10;
    const d2 = (position[0] - centralLatitude) ** 2 + (position[1] - centralLongitude) ** 2;
    const d = Math.sqrt(d2);
    return d <= radio;
  };

  componentDidUpdate = (prevProps, prevState) => {
    const RADIO1 = 10;
    const RADIO2 = 5;

    if (!isEqual(prevState.planes, this.state.planes)) {
      console.log('PASE POR DIDUPDATE');
      const newTimers = prevState.timers;
      const newPlanesState = prevState.planesState;

      const listIdPlanes = [];
      this.state.planes.map((value) => {
        listIdPlanes.push(value.id);
      });

      //Delete the planes that are no longer there from planesState
      prevState.planes.map((value) => {
        if (!(value.id in listIdPlanes)) {
          delete newPlanesState[id];
        }
      });

      this.state.planes.map((value) => {
        const { loc, id } = value;

        //Add the new planes in planeState
        if (!newPlanesState.hasOwnProperty(id)) newPlanesState[id] = 'running';

        //Plane inside RADIO1
        if (this.planeInRadio(loc, RADIO1)) {
          //Plane between RADIO1 and RADIO2
          if (!this.planeInRadio(loc, RADIO2)) {
            if (this.state.timers[id] === undefined) {
              newTimers = { ...newTimers, id: 600 };
              newPlanesState[id] = 'warning';
            }
            if (this.state.planesState[id] != 'warning') newPlanesState[id] = 'warning';
          }
          //Plane within RADIO2
          else {
            if (this.state.planesState[id] != 'alert') newPlanesState[id] = 'alert';
          }
        } else {
          if (prevState.timers[id] != undefined) {
            delete newTimers[id];
            newPlanesState[id] = 'running';
          }
        }
      });

      //setState with the parameters newPlanesState and newTimers
      this.setState({ timers: newTimers, planesState: newPlanesState });
    }
  };

  componentDidMount = () => {
    //Timer to countdown timers of planes
    if (this.countPollingIterval) clearInterval(this.countPollingIterval);
    this.countPollingIterval = setInterval(() => {
      this.setState((prevState) => this.changeStateTimer(prevState.timers));
    }, 1000);

    //Get Planes's data from API initial
    ManagerInterface.getDataFlightTracker('(-30.2326, -70.7312)', '200').then((res) => {
      //Set up initial state planesState
      const planesStateIN = {};
      res.map((value) => {
        planesStateIN[value.id] = 'running';
      });

      this.setState({
        planes: res,
        lastUpdate: Date.now(),
        planesState: planesStateIN,
      });
    });

    //Get Planes's data from API every x seconds.
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

    return { timers: newTimers };
  }

  render() {
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
          return (
            <StatusText small status={value[1]}>
              {formatSecondsToDigital(value[0])}
            </StatusText>
          );
        },
      },
      {
        field: 'latitude',
        title: 'Latitude',
      },
      {
        field: 'longitude',
        title: 'Longitude',
      },
      {
        field: 'trajectodivir parte enterary',
        title: 'Trajectory',
      },
      {
        field: 'velocity',
        title: 'velocity',
        type: 'string',
      },
    ];

    const { planes } = this.state;
    const tableData = [];
    planes.forEach((element) => {
      const { id } = element;
      tableData.push({
        ...element,
        time: [this.state.timers[id] ?? 600, this.state.planesState[id] ?? 'undefined'],
        longitude: element['loc'][0] ?? 'undefined',
        latitude: element['loc'][1] ?? 'undefined',
      });
    });

    const dateNow = Date.now();

    return (
      <>
        <div className={styles.divLastUp}>LastUpdate: {Math.round((dateNow - this.state.lastUpdate) / 1000)}seg</div>
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
      </>
    );
  }
}
