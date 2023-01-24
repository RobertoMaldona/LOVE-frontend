import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ManagerInterface, { parseCommanderData } from 'Utils';
import styles from './Microphone.module.css';
import Microphone from './Microphone';

const RADIOSLINK = {
  biobio: 'https://redirector.dps.live/biobiosantiago/mp3/icecast.audio',
  carolina:
    'https://jireh-1-hls-audio-us-isp.dps.live/hls-audio/716888c72e2079612211a7130f67a27d/carolina/playlist/manifest/gotardisz/audio/now/livestream1.m3u8?dpssid=b2191543965963287cd50987a&sid=ba5t1l1xb287782483663287cd509878',
  futuro: 'https://playerservices.streamtheworld.com/api/livestream-redirect/FUTUROAAC_SC',
  corazon: 'https://playerservices.streamtheworld.com/api/livestream-redirect/CORAZON_SC',
  adn:
    'https://24383.live.streamtheworld.com/ADN_SC?DIST=TuneIn&TGT=TuneIn&maxServers=2&gdpr=0&us_privacy=1YNY&partnertok=eyJhbGciOiJIUzI1NiIsImtpZCI6InR1bmVpbiIsInR5cCI6IkpXVCJ9.eyJ0cnVzdGVkX3BhcnRuZXIiOnRydWUsImlhdCI6MTYzMzM5MjExNiwiaXNzIjoidGlzcnYifQ.apBDljw5PC4GQwEls0GoHYCMKg91TAZrYLziiqLdh1U',
};

export default class Mics extends Component {
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
    };
  }

  render() {
    return (
      <>
        <div className={styles.mics}>
          <div className={styles.micX}>
            <Microphone source={RADIOSLINK.biobio} show={false} id={'mic1'}></Microphone>
          </div>
          <div className={styles.micX}>
            <Microphone source={RADIOSLINK.adn} show={false} id={'mic2'}></Microphone>
          </div>
        </div>
      </>
    );
  }
}
