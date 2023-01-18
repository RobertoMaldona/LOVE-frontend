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

    const radiosLink = {
      biobio: 'https://redirector.dps.live/biobiosantiago/mp3/icecast.audio',
    };
  }

  componentDidMount = () => {
    //   this.props.subscribeToStreams();
  };

  componentWillUnmount = () => {
    //   this.props.unsubscribeToStreams();
  };

  render() {
    return (
      <audio autoplay controls="controls">
        {' '}
        <source src="http://listen.radionomy.com/abc-jazz" type="audio/ogg" />{' '}
      </audio>
    );
    /*print */

    /*
      <!DOCTYPE html>
      <html>
        <head>
          <title>Streaming de audio en HTML5</title>
          <meta name="viewport" content="initial-scale=1.0">
          <meta charset="utf-8">
          <!--Importamos la librería-->
          <script src="audiojs/audio.min.js"></script>
          <script>
            // Inicializando los audios
            audiojs.events.ready(function() {
              var as = audiojs.createAll();
            });
          </script>
        </head>
        <body>
          <audio src="http://listen.radionomy.com/abc-jazz" preload="none"></audio>
        </body>
      </html> 
       */
  }
}
