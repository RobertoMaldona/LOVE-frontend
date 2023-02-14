import React from 'react';
import { connect } from 'react-redux';
import { addGroup, removeGroup } from '../../redux/actions/ws';
import {} from '../../redux/selectors';
import SubscriptionTableContainer from '../GeneralPurpose/SubscriptionTable/SubscriptionTable.container';
import FlightTracker from './FlightTracker';
import MapFlightTracker from './MapFlightTracker';

export const schema = {
  description: 'Component that displays the aircraft tracker on planes above the observatory.',
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
    hasRawMode: {
      type: 'boolean',
      description: 'Whether the component has a raw mode version',
      isPrivate: true,
      default: false,
    },
  },
};

const FlightTrackerContainer = ({ ...props }) => {
  return <FlightTracker />;
};

export default FlightTrackerContainer;
