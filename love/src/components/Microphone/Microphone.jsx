import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ManagerInterface, { parseCommanderData } from 'Utils';
import Recorder from 'recorder-js';
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
      play: false,
    };
  }

  // static radiosLink = {
  //   biobio: 'https://redirector.dps.live/biobiosantiago/mp3/icecast.audio',
  //   carolina:
  //     'https://jireh-1-hls-audio-us-isp.dps.live/hls-audio/716888c72e2079612211a7130f67a27d/carolina/playlist/manifest/gotardisz/audio/now/livestream1.m3u8?dpssid=b2191543965963287cd50987a&sid=ba5t1l1xb287782483663287cd509878',
  //   futuro: 'https://playerservices.streamtheworld.com/api/livestream-redirect/FUTUROAAC_SC',
  //   corazon: 'https://playerservices.streamtheworld.com/api/livestream-redirect/CORAZON_SC',
  //   adn:
  //     'https://24383.live.streamtheworld.com/ADN_SC?DIST=TuneIn&TGT=TuneIn&maxServers=2&gdpr=0&us_privacy=1YNY&partnertok=eyJhbGciOiJIUzI1NiIsImtpZCI6InR1bmVpbiIsInR5cCI6IkpXVCJ9.eyJ0cnVzdGVkX3BhcnRuZXIiOnRydWUsImlhdCI6MTYzMzM5MjExNiwiaXNzIjoidGlzcnYifQ.apBDljw5PC4GQwEls0GoHYCMKg91TAZrYLziiqLdh1U',
  // };

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
    document.querySelector('audio').load();
  }

  componentDidMount = () => {
    // this.props.subscribeToStreams();
    // const AudioContext = window.AudioContext || window.webkitAudioContext;
    // const audioCtx = new AudioContext();
    // const audioElement = document.querySelector('audio');
    // console.log(audioElement);
    // const track = audioElement ? audioCtx.createMediaElementSource(audioElement):null;
    // console.log(track);
    // const script = document.createElement("script");
    // script.src = "https://www.WebRTC-Experiment.com/RecordRTC.js";
    // script.async = true;
    // document.body.appendChild(script);

    this.song.crossOrigin = 'anonymous';
    this.masterGain.gain.value = 0.5;
    this.songSource.connect(this.masterGain);
    this.masterGain.connect(this.audioContext.destination);

    var options = {
      type: 'audio',
      numberOfAudioChannels: 2,
      checkForInactiveTracks: true,
      bufferSize: 16384,
      onAnalysed: (data) => console.log(data),
    };
    this.recorder = new Recorder(this.songSource, options);
  };

  componentDidUpdate = () => {
    //   this.props.unsubscribeToStreams();
  };

  // let start_button  = document.getElementById('start'),
  // radios        = document.querySelectorAll('input[name="radio-selection"]'),
  // radios_length = radios.length,
  // audioContext,
  // masterGain;

  // ========================================================
  // Audio Setup
  // ========================================================

  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  recorder;
  masterGain = this.audioContext.createGain();
  songPlaying = false;
  song = new Audio('https://playerservices.streamtheworld.com/api/livestream-redirect/CORAZON_SC');
  songSource = this.audioContext.createMediaElementSource(this.song);
  node;
  blob = null;

  audioSetup() {}

  createDownloadLink(blob) {
    var url = URL.createObjectURL(blob);
    var au = document.createElement('audio');
    var li = document.createElement('li');
    var link = document.createElement('a');

    //name of .wav file to use during upload and download (without extendion)
    var filename = new Date().toISOString();

    //add controls to the <audio> element
    au.controls = true;
    au.src = url;

    //save to disk link
    link.href = url;
    link.download = filename + '.wav'; //download forces the browser to donwload the file using the  filename
    link.innerHTML = 'Save to disk';

    //add the new audio element to li
    li.appendChild(au);

    //add the filename to the li
    li.appendChild(document.createTextNode(filename + '.wav '));

    //add the save to disk link to li
    li.appendChild(link);

    //upload link
    var upload = document.createElement('a');
    upload.href = '#';
    upload.innerHTML = 'Upload';
    upload.addEventListener('click', function (event) {
      var xhr = new XMLHttpRequest();
      xhr.onload = function (e) {
        if (this.readyState === 4) {
          console.log('Server returned: ', e.target.responseText);
        }
      };
      var fd = new FormData();
      fd.append('audio_data', blob, filename);
      xhr.open('POST', 'upload.php', true);
      xhr.send(fd);
    });
    li.appendChild(document.createTextNode(' ')); //add a space in between
    li.appendChild(upload); //add the upload link to li

    //add the li element to the ol
    let recordingsList = document.getElementById('recordingsList');
    recordingsList.appendChild(li);
  }

  render() {
    const buuf = document.querySelector('audio') ? document.querySelector('audio').src : null;

    // let song = new Audio('https://redirector.dps.live/biobiosantiago/mp3/icecast.audio');

    // console.log(buuf);
    return (
      <>
        <div>
          <button
            onClick={() => {
              if (!this.state.play) {
                this.audioContext.resume();
                this.song.play();
                this.setState({ play: true });
              } else {
                this.song.pause();
                this.setState({ play: false });
              }
            }}
          >
            Play Radio
          </button>

          <button
            onClick={() => {
              console.log(this.recorder);
              this.recorder
                .start()
                .catch(function (err) {
                  console.log(err);
                })
                .then(() => {
                  console.log('Recording started');
                });
            }}
          >
            Record
          </button>
          <button
            onClick={() => {
              this.recorder.stop().then(({ blob, buffer }) => {
                this.blob = blob;
              });
              // this.recorder.exportWAV(this.createDownloadLink);
              console.log('Recording started');
              console.log('Blob:', this.blob);
            }}
          >
            Stop Record
          </button>
          {/* <p>{this.state.namesRadio}</p>
        <audio autoPlay controls="controls">
          {' '}
          <source src={this.state.linkRadio} type="audio/ogg"/>{' '}
        </audio> */}
        </div>
        <ol id="recordingsList"></ol>
      </>
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
