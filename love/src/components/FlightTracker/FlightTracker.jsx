import React, { Component } from 'react';
import styles from './FlightTracker.module.css';
import MapFlightTracker from './MapFlightTracker';
import Value from '../GeneralPurpose/SummaryPanel/Value';
import Title from '../GeneralPurpose/SummaryPanel/Title';
import StatusText from '../GeneralPurpose/StatusText/StatusText';
import Button from '../GeneralPurpose/Button/Button';
import isEqual, { remove } from 'lodash';
import SimpleTable from 'components/GeneralPurpose/SimpleTable/SimpleTable';
import ManagerInterface, { formatSecondsToDigital } from 'Utils';
import ZoomInIcon from 'components/icons/Zoom/ZoomInIcon';
import ZoomOutIcon from 'components/icons/Zoom/ZoomOutIcon';
import PaginatedTable from 'components/GeneralPurpose/PaginatedTable/PaginatedTable';
import Input from 'components/GeneralPurpose/Input/Input';

const DEFAULT_POLLING_TIMEOUT = 5000;

export default class FlightTracker extends Component {
  constructor(props) {
    super(props);
    this.pollingInterval = null;
    this.countPollingIterval = null;
    this.state = {
      planes: [],
      planesState: {},
      lastUpdate: 0,
      planesDistance: {},
      zoom: '200',
      renderPlanes: null,
    };
  }

  /**
   * @param {*} position: list with latitude and lonegitude
   * @param {*} radio: radio to explore
   * @returns float, that represent the distance to the observatory
   * THis function uses Haversine formula.
   */
  planeDistance = (position) => {
    const origin = [-30.240476801377167, -70.73709442008416];
    const earthRadius = 6371; // in km
    const angle1 = (origin[0] * Math.PI) / 180; // in radians
    const angle2 = (position[0] * Math.PI) / 180;
    const deltaAngle1 = ((position[0] - origin[0]) * Math.PI) / 180;
    const deltaAngle2 = ((position[1] - origin[1]) * Math.PI) / 180;

    const a = Math.sin(deltaAngle1 / 2) ** 2 + Math.cos(angle1) * Math.cos(angle2) * Math.sin(deltaAngle2 / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = earthRadius * c; // in km
    return d;
  };

  componentDidUpdate = (prevProps, prevState) => {
    const RADIO1 = 160;
    const RADIO2 = 100;

    if (!isEqual(prevState.planes, this.state.planes)) {
      // const newTimers = prevState.timers;
      const newPlanesState = prevState.planesState;
      const newPlanesDistance = {};

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

        const dist = this.planeDistance(loc);
        newPlanesDistance[id] = dist;
        //Add the new planes in planeState
        if (!newPlanesState.hasOwnProperty(id)) newPlanesState[id] = 'running';

        //Plane inside RADIO1
        if (dist < RADIO1) {
          //Plane between RADIO1 and RADIO2
          if (!dist < RADIO2) {
            if (this.state.planesState[id] != 'warning') newPlanesState[id] = 'warning';
          }
          //Plane within RADIO2
          else {
            if (this.state.planesState[id] != 'alert') newPlanesState[id] = 'alert';
          }
        } else {
          if (this.state.planesState[id] != 'running') {
            newPlanesState[id] = 'running';
          }
        }
      });

      //setState with the parameters newPlanesState
      this.setState({ planesState: newPlanesState, planesDistance: newPlanesDistance });
    }
  };

  componentDidMount = () => {
    //Get Planes's data from API initial
    ManagerInterface.getDataFlightTracker('(-30.2326, -70.7312)', '200').then((res) => {
      //Set up initial state planesState
      const planesStateIN = {};
      // const timers = {};
      const planeDistance = {};
      res.map((value) => {
        planesStateIN[value.id] = 'running';
        const distance = this.planeDistance(value.loc);
        planeDistance[value.id] = distance;
        if (distance < 160) {
          if (distance < 100) planesStateIN[value.id] = 'alert';
          else planesStateIN[value.id] = 'warning';
        }
      });

      this.setState({
        planes: res,
        lastUpdate: Date.now(),
        planesState: planesStateIN,
        planesDistance: planeDistance,
      });
      console.log(res);
    });

    // //Get Planes's data from API every x seconds.
    // if (this.pollingInterval) clearInterval(this.pollingInterva);
    // this.pollingInterval = setInterval(
    //   () => {
    //     ManagerInterface.getDataFlightTracker('(-30.2326, -70.7312)', '200').then((res) => {
    //       this.setState({
    //         planes: res,
    //         lastUpdate: Date.now(),
    //       });
    //     });
    //   },
    //   this.props.pollingTimeout ? this.props.pollingTimeout * 1000 : DEFAULT_POLLING_TIMEOUT,
    // );
  };

  /*
    Returns a new Dictionary of timers, to change in setState
  */
  changeStateTimer = (timers) => {
    const newTimers = timers;
    for (const [key, value] of Object.entries(newTimers)) {
      if (value > 0) {
        newTimers[key] = value - 1;
      }
    }
    return { timers: newTimers };
  };

  /**
   * Function to set zoom state by the button Zoom In
   */
  zoomIn = () => {
    const { zoom } = this.state;
    if (zoom === '200') this.setState({ zoom: '160' });
    else if (zoom === '160') this.setState({ zoom: '100' });
  };

  /**
   * Function to set zoom state by the button Zoom Out
   */
  zoomOut = () => {
    const { zoom } = this.state;
    if (zoom === '100') this.setState({ zoom: '160' });
    else if (zoom === '160') this.setState({ zoom: '200' });
  };

  getData = (itemsPerPage, page) => {
    const { planes } = this.state;
    const tableData = [];
    for (let i = page * itemsPerPage; i < (page + 1) * itemsPerPage; i++) {
      let element = planes[i];
      if (!element) break;
      const { id } = element;
      tableData.push({
        ...element,
        longitude: element['loc'][0] ?? 'undefined',
        latitude: element['loc'][1] ?? 'undefined',
        distance: [Math.round(this.state.planesDistance[id]) ?? 'undefined', this.state.planesState[id] ?? 'undefined'],
      });
    }
    return tableData;
  };

  printData = (data) => {
    data?.map((v) => console.log(v));
  };
  render() {
    const headers = [
      {
        field: 'id',
        title: 'AirCraft ID',
        type: 'string',
      },
      {
        field: 'distance',
        title: 'Distance To Center',
        type: 'array',
        className: styles.statusColumn,
        render: (value) => {
          return (
            <StatusText small status={value[1]}>
              {value[0].toString() + 'km'}
            </StatusText>
          );
        },
      },
      {
        field: 'latitude',
        title: 'Latitude',
        render: (value) => {
          return Math.round(value * 100) / 100;
        },
      },
      {
        field: 'longitude',
        title: 'Longitude',
        render: (value) => {
          return Math.round(value * 1000) / 1000;
        },
      },

      {
        field: 'vel',
        title: 'Velocity',
        type: 'string',
        render: (value) => {
          return value + 'mph';
        },
      },
    ];

    const { planes } = this.state;
    const tableData = [];
    planes.forEach((element) => {
      const { id } = element;
      for (let i = 1; i < 4; i++) {
        tableData.push({
          ...element,
          longitude: element['loc'][0] ?? 'undefined',
          latitude: element['loc'][1] ?? 'undefined',
          distance: [
            Math.round(this.state.planesDistance[id]) ?? 'undefined',
            this.state.planesState[id] ?? 'undefined',
          ],
        });
      }
    });

    let timerLength = 0;
    for (const [key, value] of Object.entries(this.state.planesState)) {
      if (value != 'running') {
        timerLength += 1;
      }
    }

    const inRadius = timerLength > 0 ? 'warning' : 'ok';

    return (
      <div className={styles.ftComponent}>
        <div className={styles.container}>
          <div className={styles.statusDiv}>
            <div className={styles.statusDivElement}>
              <div className={styles.statusElement}>
                <Title>Monitoring status</Title>
              </div>
              <div className={styles.statusElement}>
                <StatusText title={'Monitoring status'} status={'running'} small>
                  {'Connected'}
                </StatusText>
              </div>
            </div>
            <div className={styles.statusDivElement}>
              <div className={styles.statusElement}>
                {/* <Title>Aircraft in Radius</Title> */}
                Aircraft in Radius
              </div>
              <div className={styles.statusElement}>
                <Value>
                  <StatusText title={'Aircraft in Radius'} status={inRadius} small>
                    {timerLength.toString()}
                  </StatusText>
                </Value>
              </div>
            </div>
          </div>
        </div>
        <br></br>
        <PaginatedTable
          title={'PAGINATED TABLE'}
          headers={headers}
          data={tableData}
          callBack={this.printData}
          paginationOptions={[5, 10, 15, 20]}
        ></PaginatedTable>
        <div>
          <Input></Input>
        </div>
      </div>
    );
  }
}
