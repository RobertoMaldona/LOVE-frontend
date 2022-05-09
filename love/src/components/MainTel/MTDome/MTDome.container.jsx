import React from 'react';
import { connect } from 'react-redux';
import Dome from './MTDome';
import { getDomeState, getLouversStatus } from '../../../redux/selectors';
import { addGroup, removeGroup } from '../../../redux/actions/ws';
import SubscriptionTableContainer from '../../GeneralPurpose/SubscriptionTable/SubscriptionTable.container';

export const schema = {
  description: 'Summary view of the MTDome. Contains general information about the dome and louvers state',
  defaultSize: [51, 45],
  props: {
    title: {
      type: 'string',
      description: 'Name displayed in the title bar (if visible)',
      isPrivate: false,
      default: 'Main Telescope Dome',
    },
    controls: {
      type: 'boolean',
      description: "Whether to display controls to configure periods of time'",
      default: true,
      isPrivate: false,
    },
  },
};

// The following variables are from ATDome. It's needs replace them for MTDome
const MTDomeContainer = ({
  subscribeToStream,
  unsubscribeToStream,

  actualPositionLouvers,
  commandedPositionLouvers,
  ...props
}) => {
  if (props.isRaw) {
    return <SubscriptionTableContainer subscriptions={props.subscriptions}></SubscriptionTableContainer>;
  }
  return (
    <Dome
      //
      actualPositionLouvers={actualPositionLouvers}
      commandedPositionLouvers={commandedPositionLouvers}
    />
  );
};

const mapStateToProps = (state) => {
  const domeState = getDomeState(state);
  const louversState = getLouversStatus(state);
  return { ...domeState, ...louversState };
};

// The following subscriptions are from ATDome. It's neccesary replace them for MTDome subscriptions
const mapDispatchToProps = (dispatch) => {
  const subscriptions = [
    'telemetry-ATDome-0-dropoutDoorOpeningPercentage',
    'telemetry-ATDome-0-mainDoorOpeningPercentage',
    'telemetry-ATDome-0-azimuthPosition',
    'event-ATDome-0-azimuthState',
    'event-ATDome-0-azimuthCommandedState',
    'event-ATDome-0-dropoutDoorState',
    'event-ATDome-0-mainDoorState',
    'event-ATDome-0-allAxesInPosition',
    'telemetry-ATMCS-0-mount_AzEl_Encoders',
    'telemetry-ATMCS-0-mount_Nasmyth_Encoders',
    'event-ATMCS-0-detailedState',
    'event-ATMCS-0-atMountState',
    'event-ATMCS-0-target',
    'event-ATMCS-0-allAxesInPosition',
    'event-ATMCS-0-m3State',
    'event-ATMCS-0-positionLimits',
    'telemetry-ATPtg-1-currentTimesToLimits',
  ];
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

export default connect(mapStateToProps, mapDispatchToProps)(MTDomeContainer);
