import React from 'react';
import PropTypes from 'prop-types';
import styles from './DigitalClock.module.css';
import * as dayjs from 'dayjs';
import { DateTime } from 'luxon';


/**
 * Component that displays time and optionally the date below
 */
DigitalClock.propTypes = {
  /** Date-able object or float, if float it must be in milliseconds */
  timestamp: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  /** Flag to display or not the date, true by default */
  showDate: PropTypes.bool,
}

DigitalClock.defaultProps = {
  timestamp: DateTime.local(),
  showDate: true,
}

export default function DigitalClock ({ timestamp, showDate }) {
  const t = timestamp instanceof DateTime ? timestamp :
    timestamp instanceof Date ? DateTime.fromJSDate(timestamp) : DateTime.fromMillis(timestamp);
  return (
    <div className={styles.container}> 
      <div className={styles.time}> 
        { t.toFormat('HH:mm:ss') }
      </div>
     { showDate && (<div className={styles.date}> 
        { t.toFormat('ddd, MMM DD YYYY') }
      </div>)}
    </div>
  );
}
