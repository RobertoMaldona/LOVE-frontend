import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './CurrentTargetValue.module.css';

export default class CurrentTargetValue extends Component {
  static propTypes = {
    /** Current value */
    currentValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    /** Target value */
    targetValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    /** Whether the value is still reaching the target value */
    isChanging: PropTypes.bool,
  };

  static defaultProps = {
    currentValue: 0,
    targetValue: 0,
  };

  render() {
    const isChanging = this.props.currentValue !== this.props.targetValue;
    return (
      <span className={styles.statusTextWrapper}>
        <span className={styles.telemetryValue}>{this.props.currentValue}º</span>
        {isChanging ? (
          <>
            <span className={styles.arrow}>&#8594;</span>
            <span className={styles.telemetryValue}>{this.props.targetValue}º</span>
          </>
        ) : null}
      </span>
    );
  }
}
