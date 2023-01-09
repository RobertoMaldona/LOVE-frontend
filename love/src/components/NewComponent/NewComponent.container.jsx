import React, { useState } from 'react';
import NewComponent from './NewComponent';
import { getAzElState } from '../../redux/selectors';
import { addGroup, removeGroup } from '../../redux/actions/ws';
import { connect } from 'react-redux';

export const schema = {
  description: 'Azimuth and elevation',
  defaultSize: [57, 35],
  props: {
    title: {
      type: 'string',
      description: 'Name diplayed in the title bar (if visible)',
      isPrivate: false,
      default: 'Nueva Componente',
    },
    controls: {
      type: 'boolean',
      description: "Whether to display controls to configure periods of time'",
      default: true,
      isPrivate: false,
    },
  },
};

const NewComponentContainer = ({ azimuth, elevation, azElMountEncoders, subscribeToStream, unsubscribeToStream }) => {
  return (
    <NewComponent
      azimuth={azimuth}
      elevation={elevation}
      azElMountEncoders={azElMountEncoders}
      subscribeToStream={subscribeToStream}
      unsubscribeToStream={unsubscribeToStream}
    />
  );
};

const mapStateToProps = (state) => {
  const AzElState = getAzElState(state);
  return AzElState;
};

const mapDispatchToProps = (dispatch) => {
  const subscriptions = ['telemetry-ATMCS-0-mount_AzEl_Encoders'];
  return {
    subscriptions,
    subscribeToStream: () => {
      subscriptions.forEach((stream) => dispatch(addGroup(stream)));
    },
    unsubscribeToStream: () => {
      subscriptions.forEach((stream) => dispatch(removeGroup(stream)));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NewComponentContainer);
