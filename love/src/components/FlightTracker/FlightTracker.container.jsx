import React from 'react';
import { connect } from 'react-redux';
import { addGroup, removeGroup } from '../../redux/actions/ws';
import {} from '../../redux/selectors';
import SubscriptionTableContainer from '../GeneralPurpose/SubscriptionTable/SubscriptionTable.container';
import FlightTracker from './FlightTracker';

export const schema = {
  description: 'Component that displays the position of the camera',
  defaultSize: [30, 30],
  props: {
    titleBar: {
      type: 'boolean',
      description: 'Tittlebar of this',
      isPrivate: false,
      default: false,
    },
    title: {
      type: 'string',
      description: 'Name diplayed in the title bar (if visible)',
      isPrivate: false,
      default: 'CSC details',
    },
  },
};

const FlightTrackerContainer = ({
  //   subscribeToStream,
  //   unsubscribeToStream,
  ...props
}) => {
  if (props.isRaw) {
    return <SubscriptionTableContainer /*subscriptions={props.subscriptions}*/></SubscriptionTableContainer>;
  }
  return (
    <FlightTracker
    //   subscribeToStream={subscribeToStream}
    //   unsubscribeToStream={unsubscribeToStream}
    />
  );
};

const mapStateToProps = (state) => {
  return;
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

// export default connect(mapStateToProps, mapDispatchToProps)(CircleContainer);
export default FlightTrackerContainer;
