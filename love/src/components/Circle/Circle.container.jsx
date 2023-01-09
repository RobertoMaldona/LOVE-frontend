import React from 'react';
import { connect } from 'react-redux';
import { addGroup, removeGroup } from '../../redux/actions/ws';
import { getATMCSpos } from '../../redux/selectors';
import SubscriptionTableContainer from '../GeneralPurpose/SubscriptionTable/SubscriptionTable.container';
import Circle from './Circle';

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
    margin: {
      type: 'boolean',
      description: 'Whether to display component with a margin',
      isPrivate: false,
      default: false,
    },
    az: {
      type: 'int',
      description: 'azimuth',
      isPrivate: false,
      default: 0,
    },
    el: {
      type: 'int',
      description: 'elevation',
      isPrivate: false,
      default: 0,
    },
    color: {
      type: 'string',
      description: 'Color of circle',
      isPrivate: false,
      default: 'red',
    },
  },
};

const CircleContainer = ({
  subscribeToStream,
  unsubscribeToStream,
  az,
  el,
  color,
  azMount,
  elMount,
  azimuthPosition,
  ...props
}) => {
  if (props.isRaw) {
    return <SubscriptionTableContainer subscriptions={props.subscriptions}></SubscriptionTableContainer>;
  }
  return (
    <Circle
      az={az}
      el={el}
      color={color}
      azMount={azMount}
      elMount={elMount}
      subscribeToStream={subscribeToStream}
      unsubscribeToStream={unsubscribeToStream}
      azimuthPosition={azimuthPosition}
    />
  );
};

const mapStateToProps = (state) => {
  const circleState = getATMCSpos(state);
  return circleState;
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

export default connect(mapStateToProps, mapDispatchToProps)(CircleContainer);

//getATMCSpos
