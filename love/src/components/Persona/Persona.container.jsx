import React from 'react';
import Persona from './Persona';

export const schema = {
  description: 'Displays a person',
  defaultSize: [12, 6],
  props: {
    titleBar: {
      type: 'boolean',
      description: 'Tittlebar of person',
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
    name: {
      type: 'string',
      description: 'Name of the person',
      isPrivate: false,
      default: 'Test',
    },
  },
};

const PersonaContainer = ({ name }) => {
  return <Persona nombre={name} />;
};

export default PersonaContainer;
