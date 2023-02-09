import React from 'react';
import LimitTimeSeriesPlot from './LimitTimeSeriesPlot';

export const schema = {
  description: 'Component that displays the data coming from a weather station',
  defaultSize: [57, 35],
  props: {
    title: {
      type: 'string',
      description: 'Name diplayed in the title bar (if visible)',
      isPrivate: false,
      default: 'Weather station component',
    },
    salindex: {
      type: 'number',
      description: 'Salindex of the CSC',
      isPrivate: false,
      default: 1,
    },
    hasRawMode: {
      type: 'boolean',
      description: 'Whether the component has a raw mode version',
      isPrivate: true,
      default: false,
    },
  },
};

class LimitTimeSeriesPlotContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.containerRef = React.createRef();
  }

  render() {
    const { containerNode } = this.props;

    if (!containerNode) {
      return (
        <div ref={this.containerRef}>
          <LimitTimeSeriesPlot containerNode={this.containerRef.current?.parentNode} />
        </div>
      );
    } else {
      return <LimitTimeSeriesPlot containerNode={containerNode} />;
    }
  }
}

export default LimitTimeSeriesPlotContainer;
