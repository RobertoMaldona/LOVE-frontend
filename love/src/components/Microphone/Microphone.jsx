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

      linkRadio: 'https://redirector.dps.live/biobiosantiago/mp3/icecast.audio',
      namesRadio: 'biobio',
    };

    const radiosLink = {
      biobio: 'https://redirector.dps.live/biobiosantiago/mp3/icecast.audio',
      carolina:
        'https://jireh-1-hls-audio-us-isp.dps.live/hls-audio/716888c72e2079612211a7130f67a27d/carolina/playlist/manifest/gotardisz/audio/now/livestream1.m3u8?dpssid=b2191543965963287cd50987a&sid=ba5t1l1xb287782483663287cd509878',
      futuro: 'https://playerservices.streamtheworld.com/api/livestream-redirect/FUTUROAAC_SC',
      corazon: 'https://playerservices.streamtheworld.com/api/livestream-redirect/CORAZON_SC',
      adn:
        'https://24383.live.streamtheworld.com/ADN_SC?DIST=TuneIn&TGT=TuneIn&maxServers=2&gdpr=0&us_privacy=1YNY&partnertok=eyJhbGciOiJIUzI1NiIsImtpZCI6InR1bmVpbiIsInR5cCI6IkpXVCJ9.eyJ0cnVzdGVkX3BhcnRuZXIiOnRydWUsImlhdCI6MTYzMzM5MjExNiwiaXNzIjoidGlzcnYifQ.apBDljw5PC4GQwEls0GoHYCMKg91TAZrYLziiqLdh1U',
    };
  }

  changeRadio() {
    const radiosLink = {
      biobio: 'https://redirector.dps.live/biobiosantiago/mp3/icecast.audio',
      carolina:
        'https://jireh-1-hls-audio-us-isp.dps.live/hls-audio/716888c72e2079612211a7130f67a27d/carolina/playlist/manifest/gotardisz/audio/now/livestream1.m3u8?dpssid=b2191543965963287cd50987a&sid=ba5t1l1xb287782483663287cd509878',
      futuro: 'https://playerservices.streamtheworld.com/api/livestream-redirect/FUTUROAAC_SC',
      corazon: 'https://playerservices.streamtheworld.com/api/livestream-redirect/CORAZON_SC',
      adn:
        'https://24383.live.streamtheworld.com/ADN_SC?DIST=TuneIn&TGT=TuneIn&maxServers=2&gdpr=0&us_privacy=1YNY&partnertok=eyJhbGciOiJIUzI1NiIsImtpZCI6InR1bmVpbiIsInR5cCI6IkpXVCJ9.eyJ0cnVzdGVkX3BhcnRuZXIiOnRydWUsImlhdCI6MTYzMzM5MjExNiwiaXNzIjoidGlzcnYifQ.apBDljw5PC4GQwEls0GoHYCMKg91TAZrYLziiqLdh1U',
    };
    const namesRadio = ['biobio', 'carolina', 'futuro', 'corazon', 'adn'];
    const indice = Math.floor(Math.random() * namesRadio.length);
    this.setState({ linkRadio: radiosLink[namesRadio[indice]], namesRadio: namesRadio[indice] });
  }

  componentDidMount = () => {
    //   this.props.subscribeToStreams();
  };

  componentWillUnmount = () => {
    //   this.props.unsubscribeToStreams();
  };

  render() {
    return (
      <div>
        <button
          onClick={() => {
            this.changeRadio();
          }}
        >
          Cambiar radio
        </button>
        <p>{this.state.namesRadio}</p>
        <audio autoplay controls="controls">
          {' '}
          <source src={this.state.linkRadio} type="audio/ogg" />{' '}
        </audio>
      </div>
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
