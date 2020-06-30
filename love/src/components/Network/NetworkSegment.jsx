import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './Network.module.css';

export default class NetworkSegment extends Component {
  static propTypes = {
    url: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }

  componentDidMount() {
    const { metadata } = this.props;
    const baseURL = metadata.url.split(metadata.uri)[0];
    const event = metadata['event-types'].filter((e) => {
      return e['event-type'] === 'histogram-rtt';
    })[0];
    console.log(event);
    const summary = event.summaries.filter((sum) => {
      return sum['summary-type'] === 'statistics' && sum['summary-window'] === '0';
    })[0];
    const url = `${baseURL}${summary.uri}?time-range=3600`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          data: data[data.length - 1],
        });
      });
  }

  render() {
    const { metadata } = this.props;
    const { data } = this.state;
    console.log(data);
    const maxValue = data?.val?.maximum ? Math.round(data?.val?.maximum * 100) / 100 : '?';
    const minValue = data?.val?.maximum ? Math.round(data?.val?.minimum * 100) / 100 : '?';
    const meanValue = data?.val?.maximum ? Math.round(data?.val?.mean * 100) / 100 : '?';
    const valid = maxValue !== '?' && minValue !== '?' && meanValue !== '?';
    return (
      <div className={[styles.segmentContainer, valid == false ? styles.error : ''].join(' ')}>
        <div className={styles.endpointsContainer}>
          <span>Source: </span>
          <span className={[styles.highlight, styles.ip].join(' ')}>{metadata.source} </span>
          <span>Destination: </span>
          <span className={[styles.highlight, styles.ip].join(' ')}>{metadata.destination} </span>
        </div>
        <div className={styles.valuesContainer}>
          <span>Max: </span>
          <span className={styles.highlight}>{maxValue} ms</span>
          <span>Min: </span>
          <span className={styles.highlight}>{minValue} ms</span>
          <span>Mean: </span>
          <span className={styles.highlight}>{meanValue} ms</span>
        </div>
      </div>
    );
  }
}
