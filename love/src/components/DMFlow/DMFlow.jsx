import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './DMFlow.module.css';

let dataMock = [];
for (let i = 1; i < 100; i++) {
  dataMock.push({ thumbnail: 'img', imageName: 'CC_O_200202_000' + i.toString, state: Math.floor(Math.random() * 10) });
}

export default class DMFlow extends Component {
  static propTypes = {
    nombre: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount = () => {};

  render() {
    return <div className={styles.container}></div>;
  }
}
