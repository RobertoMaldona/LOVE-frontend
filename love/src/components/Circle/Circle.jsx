import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './Circle.module.css';
import { formatSecondsToDigital } from 'Utils';

export default class Circle extends Component {
  static propTypes = {
    az: PropTypes.number,
    el: PropTypes.number,
    azMount: PropTypes.number,
    elMount: PropTypes.number,
    azimuthPosition: PropTypes.number,
    color: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      time: 10,
    };
  }

  componentDidMount = () => {
    this.props.subscribeToStream();
    setInterval(() => {
      this.setState((prevState) => ({ time: prevState.time - 1 }));
    }, 1000);
  };

  componentWillUnmount = () => {
    this.props.unsubscribeToStream();
  };

  processPos(el) {
    const dist = Math.sin(((90 - el) * Math.PI) / 180) * 150;
    return dist;
  }

  render() {
    const { az } = this.props;
    const { el } = this.props;
    const { azMount, azimuthPosition } = this.props;
    const { elMount } = this.props;
    const { color } = this.props;
    const posTranslate = this.processPos(elMount);
    const height = 300;
    const width = 300;

    console.log('azMount: ' + azimuthPosition + ' elMount: ' + elMount);
    return (
      <div>
        <div className={styles.Div}>
          <svg className={styles.Svg} height={height} width={width} viewBox="0 0 300 300">
            <g className={styles.pointing}>
              <rect
                className={styles.pointing}
                width={150}
                height={30}
                x={150}
                y={135}
                opacity={0.2}
                strokeWidth={5}
                fill={'white'}
                style={{
                  transform: `rotateZ(${azimuthPosition}deg)`,
                  transformOrigin: `center center`,
                  transition: 'transform 1s linear',
                }}
              />
              <circle
                className={styles.pointing}
                r={15}
                cx={150}
                cy={150}
                fill={color}
                strokeWidth={5}
                style={{
                  // transform: `rotateZ(${az}deg) translate(${posTranslate.x}px, ${posTranslate.y}px) rotateY(${el}deg)`,
                  transform: `rotateZ(${azimuthPosition}deg) translate(${posTranslate}px, 0px) rotateY(${
                    90 - elMount
                  }deg)`,
                  transformOrigin: `center`,
                  transition: 'transform 1s linear',
                }}
              />
            </g>
          </svg>
        </div>
        <div>{formatSecondsToDigital(this.state.time)}</div>
      </div>
    );
  }
}
