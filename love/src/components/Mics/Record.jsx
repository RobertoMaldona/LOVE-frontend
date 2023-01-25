import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Record extends Component {
  static propTypes = {
    url: PropTypes.string,
    nameFile: PropTypes.string,
  };

  render() {
    const { url, nameFile } = this.props;

    return (
      <div>
        <audio controls src={url}></audio>
        <a href="" download={nameFile}>
          {nameFile}
        </a>
      </div>
    );
  }
}
