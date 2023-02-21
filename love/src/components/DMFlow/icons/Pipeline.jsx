import React from 'react';
import Exclamation from './Exclamation';
import styles from './Pipeline.module.css';

function Pipeline({ state, ...props }) {
  let alert = (
    <>
      <path
        className={styles.alert}
        d="m45.49,14.5c-.33,0-.59.18-.59.5,0,.97.11,2.36.11,3.33,0,.25.22.36.48.36.2,0,.47-.11.47-.36,0-.97.11-2.36.11-3.33,0-.32-.27-.5-.59-.5Z"
      />
      <path className={styles.alert} d="m45.5,19.25c-.35,0-.63.28-.63.63s.28.63.63.63.63-.28.63-.63-.28-.63-.63-.63Z" />
    </>
  );
  return (
    <svg id="Layer_1" viewBox="0 0 71 23">
      <rect className={styles.complete} x=".5" y="12.5" width="10" height="10" rx="1.71" ry="1.71" />
      <path className={styles.path} d="m5.5,12.59h0c0-3.92,3.18-7.09,7.09-7.09h7.7" />
      <rect className={styles.processing} x="20.5" y=".5" width="10" height="10" rx="1.71" ry="1.71" />
      <line className={styles.path} x1="10.62" y1="17.5" x2="20.66" y2="17.5" />
      <rect className={styles.complete} x="20.5" y="12.5" width="10" height="10" rx="1.71" ry="1.71" />
      <line className={styles.path} x1="30.62" y1="17.5" x2="40.15" y2="17.5" />
      <rect className={styles.processing} x="40.5" y="12.5" width="10" height="10" rx="1.71" ry="1.71" />
      <line className={styles.wait} x1="60.48" y1="17.5" x2="50.43" y2="17.5" />
      <rect className={styles.wait} x="60.5" y="12.5" width="10" height="10" rx="1.71" ry="1.71" />

      <g className={alert ? '' : styles.noDisplay} style={{ translate: '20px 0px' }}>
        {alert}
        {/* <path className={styles.alert} d="m45.49,14.5c-.33,0-.59.18-.59.5,0,.97.11,2.36.11,3.33,0,.25.22.36.48.36.2,0,.47-.11.47-.36,0-.97.11-2.36.11-3.33,0-.32-.27-.5-.59-.5Z"/>
        <path className={styles.alert} d="m45.5,19.25c-.35,0-.63.28-.63.63s.28.63.63.63.63-.28.63-.63-.28-.63-.63-.63Z"/> */}
      </g>
    </svg>
  );
}

export default Pipeline;
