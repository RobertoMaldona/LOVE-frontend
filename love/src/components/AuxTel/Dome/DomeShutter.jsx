import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './Dome.module.css';

export default class DomeShutter extends Component {
  static propTypes = {
    /** Skyview width */
    width: PropTypes.number,
    /** Skyview height */
    height: PropTypes.number,
    /** Azimuth position */
    azimuthPosition: PropTypes.number,
    /** Main door opening percentage */
    mainDoorOpeningPercentage: PropTypes.number,
    /** Droupout door opening percentage */
    dropoutDoorOpeningPercentage: PropTypes.number,
  };

  static defaultProps = {
    azelToPixel: () => {},
    width: 596,
    height: 596,
    azimuthPosition: 0,
    mainDoorOpeningPercentage: 0,
    dropoutDoorOpeningPercentage: 0,
  };

  render() {
    const { width, height } = this.props;
    const offset = 5;
    const viewBoxSize = 596 - 2 * offset;
    const x0 = viewBoxSize / 2 + offset;
    const y0 = viewBoxSize / 2 + offset;
    const r = viewBoxSize / 2;
    const extraApperture = r / 4;
    const alpha = Math.PI / 12;
    const rSinAlpha = r * Math.sin(alpha);
    const rCosAlpha = r * Math.cos(alpha);
    const dropoutDoorWidth = (rCosAlpha + extraApperture) * 0.4;
    const mainDoorWidth = (rCosAlpha + extraApperture) * 0.6;
    return (
      <svg className={styles.svgOverlay} height={height} width={width} viewBox="0 0 596 596">

        {/* Dome target*/}
        <path
          style={{ transform: `rotateZ(${270 + this.props.targetAzimuthPosition}deg)`, transformOrigin: `50% 50%` }}
          fill="none"
          strokeDasharray="4"
          strokeOpacity="0.3"
          stroke="white"
          strokeWidth="2"
          d={`
          M ${x0 + rCosAlpha} ${y0 + rSinAlpha}
        L ${x0 - extraApperture} ${y0 + rSinAlpha}
        L ${x0 - extraApperture} ${y0 - rSinAlpha}
        L ${x0 + rCosAlpha} ${y0 - rSinAlpha}
        `}
        />
        <g
          className={styles.rotatingDome}
          style={{ transform: `rotateZ(${270 + this.props.azimuthPosition}deg)`, transformOrigin: `50% 50%` }}
        >
          {/* Dome */}
          <path
            fill="#fff"
            fillOpacity="0.1"
            stroke="#152228"
            strokeWidth="1"
            d={`
              M ${x0 + rCosAlpha} ${y0 + rSinAlpha}
              A ${r} ${r} 0 0 1 ${x0 - rCosAlpha} ${y0 + rSinAlpha}
              A ${r} ${r} 0 0 1 ${x0 - rCosAlpha} ${y0 - rSinAlpha}
              A ${r} ${r} 0 0 1 ${x0 + rCosAlpha} ${y0 - rSinAlpha}
              L ${x0 - extraApperture} ${y0 - rSinAlpha}
              L ${x0 - extraApperture} ${y0 + rSinAlpha}
              L ${x0 + rCosAlpha} ${y0 + rSinAlpha}
            `}
          />
          {/* Dropout door */}
          <g clipPath={`circle(${r}px at center)`}>
            <circle cx={x0} cy={y0} r={r} fill="none" stroke="none" />
            <path
              fill="none"
              stroke="white"
              strokeWidth="1"
              d={`
            M ${x0 + rCosAlpha} ${y0 - rSinAlpha}
            A ${r} ${r} 0 0 1 ${x0 + rCosAlpha} ${y0 + rSinAlpha}
            M ${x0 + rCosAlpha} ${y0 - rSinAlpha}
            `}
            />
            <rect
              x={
                x0 + mainDoorWidth - extraApperture + (dropoutDoorWidth * this.props.dropoutDoorOpeningPercentage) / 100
              }
              y={y0 - rSinAlpha}
              width={r - rCosAlpha + (dropoutDoorWidth * (100 - this.props.dropoutDoorOpeningPercentage)) / 100}
              height={2 * rSinAlpha}
              fill="white"
              fillOpacity={0.2 + (0.1 * this.props.dropoutDoorOpeningPercentage) / 100}
              stroke="white"
              strokeWidth="1"
            />
          </g>

          {/* Main door */}
          <rect
            x={x0 - extraApperture - (mainDoorWidth * this.props.mainDoorOpeningPercentage) / 100}
            y={y0 - rSinAlpha}
            width={mainDoorWidth}
            height={2 * rSinAlpha}
            fill="white"
            fillOpacity="0.2"
            stroke="white"
            strokeWidth="1"
          />
          {/* <circle cx={x0} cy={y0} r={r*0.91} fill="none" stroke="red" /> */}
        </g>
        {/* <style>.cls-1{fill:#152228;fill-opacity:0;}.cls-2{opacity:0.6;}.cls-3{fill:#18313d;stroke:#152228;stroke-miterlimit:10;}</style> */}

      </svg>
    );
  }
}