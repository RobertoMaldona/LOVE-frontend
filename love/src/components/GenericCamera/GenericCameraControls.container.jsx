import React from 'react';
import { addGroup, removeGroup, requestSALCommand } from '../../redux/actions/ws';
import GenericCameraControls from './GenericCameraControls';

export const schema = {
  description: 'Controls to run live view and image taking for a GenericCamera',
  defaultSize: [10, 30],
  props: {
    margin: {
      type: 'boolean',
      description: 'Whether to display component with a margin',
      isPrivate: false,
      default: true,
    },
    salIndex: {
      type: 'integer',
      description: 'The index of the GenericCamera to control',
      isPrivate: false,
      default: 1,
    },
  },
};

const GenericCameraControlsContainer = ({ ...props }) => {
  return <GenericCameraControls {...props} />;
};

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {
    requestSALCommand: (cmd) => {
      dispatch(
        requestSALCommand({
          ...cmd,
        }),
      );
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(GenericCameraControlsContainer);
