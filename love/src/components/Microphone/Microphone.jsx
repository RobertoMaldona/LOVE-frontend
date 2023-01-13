import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ManagerInterface, { parseCommanderData } from 'Utils';

import styles from './Microphone.module.css';

export default class Microphone extends Component {
  static propTypes = {
    /* Mics's id  */
    mics: PropTypes.object,
  };

  constructor(props) {
    super(props);
    //   this.temperaturePlotRef = React.createRef();

    this.state = {
      /* Active or Descative */
      micsState: {},

      /* Notifications ON or OFF */
      notifications: {},

      /* If exists an alarm asociated to mic */
      alarms: {},

      /* The id of the selected mic to show the info */
      selectedMic: null,
    };
  }

  componentDidMount = () => {
    //   this.props.subscribeToStreams();
  };

  componentWillUnmount = () => {
    //   this.props.unsubscribeToStreams();
  };

  render() {
    return {
      /*print */
    };
  }
}
