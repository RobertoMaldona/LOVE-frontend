import React from 'react';
import { connect } from 'react-redux';
import { addGroup, removeGroup } from '../../redux/actions/ws';
import {} from '../../redux/selectors';
import SubscriptionTableContainer from '../GeneralPurpose/SubscriptionTable/SubscriptionTable.container';
import FlightTracker from './FlightTracker';
import MapFlightTracker from './MapFlightTracker';

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
  },
};

const FlightTrackerContainer = ({ ...props }) => {
  return <FlightTracker />;
};

export default FlightTrackerContainer;
