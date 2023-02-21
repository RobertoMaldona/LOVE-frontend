import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './InfoDMFlow.module.css';
import { dmFlowStatusMap, stateToStyleDMFlow } from 'Config';
import PlotDiv from './PlotDiv';

export default class Info extends Component {
  static propTypes = {
    schema: PropTypes.string,
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
    const icon = '';

    return (
      <div className={styles.div}>
        <div className={[styles.divIcon, styles.borderRadiusLeft].join(' ')}>{icon}</div>
        <div ref={this.containerRef} style={{ height: '100%', width: '100%', overflow: 'auto' }}>
          <PlotDiv schema={this.props.schema} containerNode={this.containerRef} />
        </div>
      </div>
    );
  }
}
