import React, { Component } from 'react';
import styles from './NewComponent.module.css';
import Input from 'components/GeneralPurpose/Input/Input';

function retArcEl(ElAngle, radIn) {
  // returns r*.
  return radIn * Math.sin(((ElAngle + 90) * Math.PI) / 180);
}

export default class NewComponent extends Component {
  constructor() {
    super();
    this.state = {
      azimuth: 0,
      elevation: 0,
      az: 0,
      el: 0,
    };
  }

  componentDidMount = () => {
    this.props.subscribeToStream();
  };

  componentWillUnmount = () => {
    this.props.unsubscribeToStream();
  };

  updateAzimuthValue = (value) => {
    this.setState({
      azimuth: Math.abs(Number(value)),
    });
  };

  updateElevationValue = (value) => {
    this.setState({
      elevation: Math.abs(Number(value)),
    });
  };

  render() {
    const { azimuth } = this.state;
    const { elevation } = this.state;
    const radIn = 50;
    const currentPointing = {
      az: this.props.azElMountEncoders ? this.props.azElMountEncoders.azimuthCalculatedAngle.value[0] : 0,
      el: this.props.azElMountEncoders ? this.props.azElMountEncoders.elevationCalculatedAngle.value[0] : 0,
    };
    return (
      <div className={styles.container}>
        <div className={styles.paramContainer}>
          <div className={styles.paramLabel}>{'Azimuth :'}</div>
          <div className={styles.inputAzimuth}>
            <Input onChange={(e) => this.updateAzimuthValue(e.target.value)} />
          </div>
        </div>

        <div className={styles.paramContainer}>
          <div className={styles.paramLabel}>{'Elevation :'}</div>
          <div className={styles.inputElevation}>
            <Input onChange={(e) => this.updateElevationValue(e.target.value)} />
          </div>
        </div>

        <div className={styles.svg}>
          <svg viewBox="0 0 100 100">
            <circle className={styles.circleLimit} cx="50%" cy="50%" r={radIn} />
            <circle className={styles.circleCenter} cx="50%" cy="50%" r="1" fill="red" />
            <circle
              className={styles.circle}
              cx={50}
              cy={50}
              r={4}
              style={{
                transform: `rotateZ(${-currentPointing.az}deg) translate(${0}px, ${retArcEl(
                  currentPointing.el,
                  radIn,
                )}px) rotateX(${currentPointing.el - 90}deg`, // radIn ~ big circle angle.
              }}
            />
          </svg>
        </div>
      </div>
    );
  }
}
