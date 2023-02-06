import React from 'react';
import styles from './StopRec.module.css';

function StopRecIcon(props) {
  return (
    <svg className={props.className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36.37 15.15">
      <rect className={styles.cls1} x=".5" y=".5" width="35.37" height="14.15" rx="6.36" ry="6.36" />
      <text className={styles.cls4} transform="translate(15.53 10.1) scale(.82 1)">
        <tspan x="0" y="0">
          R
        </tspan>
        <tspan className={styles.scls3} x="5.83" y="0">
          E
        </tspan>
        <tspan x="11.13" y="0">
          C
        </tspan>
      </text>
      <rect className={styles.cls2} x="8.1" y="5.3" width="4.03" height="4.03" />
    </svg>
  );
}

export default StopRecIcon;
