import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './MTDome.module.css';

const widthShutters = [-50, 50];
export default class DomeShutter extends Component {
  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.azimuthPosition !== this.props.azimuthPosition)
      this.prevAzimuth = this.closestEquivalentAngle(this.prevAzimuth, prevProps.azimuthPosition);
  }

  closestEquivalentAngle = (from, to) => {
    const delta = ((((to - from) % 360) + 540) % 360) - 180;
    return from + delta;
  };

  render() {
    const equivalentAzimuth = this.closestEquivalentAngle(this.prevAzimuth, this.props.azimuthPosition);
    console.log(this.props.positionActualShutter);
    console.log(widthShutters);
    return (
      <svg
        className={styles.svgOverlay}
        height={400}
        width={500}
        viewBox="0 0 301.98 301.98"
        style={{ transform: `translate(-25%, -40%) rotateZ(${this.props.positionActualDomeAz}deg` }}
      >
        {/* */}
        {/* <g class="dome" style={{ transformOrigin: 50% 50%, transform: rotate(45deg) }}> */}
        <g style={{ transformOrigin: `50% 50%`, transform: `rotate(90)` }}>
          <polygon
            className={styles.shutterCommanded}
            points="198.99 268.49 263.08 184.54 264.7 130.71 243.34 78.25 192.51 33.49 109.48 33.49 58.65 78.25 37.28 130.71 38.91 184.54 102.99 268.49 198.99 268.49"
          />
          <rect class="shutterCommanded" x="110.69" y="38.59" width="81.08" height="145.13" />
        </g>

        {/* rest of dome */}

        <rect
          className={styles.shutter2}
          x="148.97"
          y="-50.78"
          width="4.05"
          height="173.5"
          transform="translate(186.96 -115.02) rotate(90)"
        />
        <polygon
          className={styles.shutter2}
          points="198.99 268.49 263.08 184.54 264.7 130.71 243.34 78.25 192.51 33.49 109.48 33.49 58.65 78.25 37.28 130.71 38.91 184.54 102.99 268.49 198.99 268.49"
        />
        <rect className={styles.shutter2} x="110.69" y="38.59" width="81.08" height="145.13" />
        <rect class={styles.shutter3} x="110.69" y="38.59" width="81.08" height="145.13" />
        <rect
          className={styles.shutter2}
          x="148.97"
          y="73.67"
          width="4.05"
          height="219.72"
          transform="translate(334.52 32.54) rotate(90)"
        />
        <rect
          className={styles.shutter2}
          x="148.56"
          y="187.18"
          width="4.86"
          height="154.05"
          transform="translate(415.19 113.21) rotate(90)"
        />

        {/* pointing */}
        <g className={styles.pointing} /*style={{ transformOrigin: `50% 50%`, transform: `translate(0, -30px)` }}*/>
          <rect className={styles.shutter4} x="110.69" y="114.81" width="81.08" height="64.86" />
          <circle className={styles.shutter6} cx="151.22" cy="147.24" r="5.68" />
        </g>
        {/* Shutter commanded right */}
        <g className={styles.shutterCommanded} /*style={{ display: `none` }}*/>
          <polygon
            className={styles.shutterCommanded}
            points="201.8 188.53 151.53 188.53 151.53 72.59 200.18 72.59 201.8 188.53"
          />
          <polygon
            className={styles.shutterCommanded}
            points="200.18 72.59 151.53 72.59 151.53 28.81 196.93 28.81 200.18 72.59"
          />
          <rect className={styles.shutterCommanded} x="151.53" y="188.53" width="50.27" height="12.97" />
        </g>
        {/* Shutter commanded left */}
        <g className={styles.shutterCommanded} style={{ display: `none` }}>
          <polygon
            className={styles.shutterCommanded}
            points="100.19 188.53 150.45 188.53 150.45 72.59 101.81 72.59 100.19 188.53"
          />
          <polygon
            className={styles.shutterCommanded}
            points="101.81 72.59 150.45 72.59 150.45 28.81 105.05 28.81 101.81 72.59"
          />
          <rect className={styles.shutterCommanded} x="100.19" y="188.53" width="50.27" height="12.97" />
        </g>
        {/* Shutter rigth */}
        <g
          className={styles.shutter}
          style={{
            transformOrigin: `50% 50%`,
            transform: `translate(${(this.props.positionActualShutter * widthShutters[1]) / 100}px, 0)`,
          }}
        >
          <polygon
            className={styles.shutter}
            points="201.8 188.53 151.53 188.53 151.53 72.59 200.18 72.59 201.8 188.53"
          />
          <polygon
            className={styles.shutter}
            points="200.18 72.59 151.53 72.59 151.53 28.81 196.93 28.81 200.18 72.59"
          />
          <rect className={styles.shutter} x="151.53" y="188.53" width="50.27" height="12.97" />
        </g>
        {/* Shutter left */}
        <g
          className={styles.shutter}
          style={{
            transformOrigin: `50% 50%`,
            transform: `translate(${(this.props.positionActualShutter * widthShutters[0]) / 100}px, 0)`,
          }}
        >
          <polygon
            className={styles.shutter}
            points="100.19 188.53 150.45 188.53 150.45 72.59 101.81 72.59 100.19 188.53"
          />
          <polygon
            className={styles.shutter}
            points="101.81 72.59 150.45 72.59 150.45 28.81 105.05 28.81 101.81 72.59"
          />
          <rect className={styles.shutter} x="100.19" y="188.53" width="50.27" height="12.97" />
        </g>
      </svg>
    );
  }
}
