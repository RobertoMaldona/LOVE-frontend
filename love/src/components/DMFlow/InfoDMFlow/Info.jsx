import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './InfoDMFlow.module.css';
import { dmFlowStatusMap, stateToStyleDMFlow } from 'Config';
import PlotDiv from './PlotDiv';
import Connection from '../icons/Connection/Connection';

export default class Info extends Component {
  static propTypes = {
    /**
     * If schema exist, the component plot the connection
     */
    schema: PropTypes.string,
    /**
     * State of connection
     */
    state: PropTypes.string,
    /**
     * If schema no exist, the component render only the name
     */
    name: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.containerRef = React.createRef();
  }

  componentDidMount = () => {};

  componentDidUpdate = (prevProps) => {};

  componentWillUnmount = () => {};

  render() {
    const icon = <Connection state={this.props.state ?? 'disabled'}></Connection>;

    return (
      <div className={styles.component}>
        <div className={styles.div}>
          <div className={[styles.divIcon, styles.borderRadiusLeft].join(' ')}>{icon}</div>
          {this.props.schema ? (
            <div ref={this.containerRef} style={{ height: '100%', width: '100%', overflow: 'auto' }}>
              <PlotDiv schema={this.props.schema} containerNode={this.containerRef} />
            </div>
          ) : (
            <div className={styles.divName}> {this.props.name}</div>
          )}
        </div>
      </div>
    );
  }
}
