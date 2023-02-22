import React from 'react';
import styles from './Connection.module.css';
import Danger from './Danger';
import Disabled from './Disabled';
import Enabled from './Enabled';
import Error from './Error';

function Connection(props) {
  const mapStateToRender = (state) => {
    if (state == 'enabled') return <Enabled></Enabled>;
    if (state == 'disabled') return <Disabled></Disabled>;
    if (state == 'danger') return <Danger></Danger>;
    if (state == 'error') return <Error></Error>;
    return ' ';
  };
  const { state } = props;
  const svg = mapStateToRender(state);
  return svg;
  mapStateToRender(state);
}

export default Connection;
