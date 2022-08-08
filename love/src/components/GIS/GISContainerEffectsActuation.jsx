import React, { Component } from 'react';
import styles from './GIS.module.css';

export default class GISContainerEffectsActuation extends Component {
  render() {
    const { activeEffects, alertEffects } = this.props;
    return (
      <div className={styles.div2}>
        <h3 className={styles.h3}>Effects/Actuation</h3>
        {this.props.effects.map(([system, effects]) => (
          <div
            className={[
              styles.system,
              effects.some((effect) => alertEffects.includes(effect)) ? styles.alertSystem : '',
            ].join(' ')}
          >
            <h3>{system}</h3>
            {effects.map((effect) => (
              <div
                className={[
                  styles.signal,
                  activeEffects.includes(effect) ? '' : activeEffects.length > 0 ? styles.inactive : '',
                  alertEffects.includes(effect) ? styles.alert : '',
                ].join(' ')}
              >
                {effect}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
}
