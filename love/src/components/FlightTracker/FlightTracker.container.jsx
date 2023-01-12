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
      default: true,
    },
    title: {
      type: 'string',
      description: 'Name diplayed in the title bar (if visible)',
      isPrivate: false,
      default: 'Flight Tracker',
    },
    // planes:  {
    //   type: 'array',
    //   description: 'Planes',
    //   isPrivate: false,
    //   default: [
    //     {
    //       id: 'LAN54',
    //       latitude: '28.4545454',
    //       longituded:'28.4545454',
    //       trajectory:'28.4545454',
    //       velocity:'450mph',
    //     },
    //   ],
    // },
  },
};

const FlightTrackerContainer = ({
  //   subscribeToStream,
  //   unsubscribeToStream,
  planes,
  ...props
}) => {
  return (
    <FlightTracker
      planes={planes}
      //   subscribeToStream={subscribeToStream}
      //   unsubscribeToStream={unsubscribeToStream}
    />
  );
};
// getDataFlightTracker

// export default connect(mapStateToProps, mapDispatchToProps)(FlightTrackerContainer);
export default FlightTrackerContainer;
