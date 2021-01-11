import React from 'react';
import { connect } from 'react-redux';
import { addGroup, requestGroupRemoval } from 'redux/actions/ws';
import { getStreamsData } from 'redux/selectors/selectors';
import Plot from './Plot';
import { parseTimestamp } from 'Utils';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
 
const moment = extendMoment(Moment);

export const defaultStyles = [
  {
    color: '#ff7bb5',
    shape: 'circle',
    filled: false,
    dash: [4, 0],
  },
  {
    color: '#00b7ff',
    shape: 'square',
    filled: true,
    dash: [4, 0],
  },

  {
    color: '#97e54f',
    shape: 'diamond',
    filled: true,
    dash: [4, 0],
  },
];

export const schema = {
  description: 'Time series plot for any data stream coming from SAL',
  defaultSize: [8, 8],
  props: {
    titleBar: {
      type: 'boolean',
      description: 'Whether to display the title bar',
      isPrivate: true,
      default: false,
    },
    title: {
      type: 'string',
      description: 'Name diplayed in the title bar (if visible)',
      isPrivate: true,
      default: 'Time series plot',
    },
    hasRawMode: {
      type: 'boolean',
      description: 'Whether the component has a raw mode version',
      isPrivate: true,
      default: false,
    },
    inputs: {
      externalStep: 'TimeSeriesConfig',
      type: 'object',
      description: 'list of inputs',
      isPrivate: false,
      default: {
        Elevation: {
          category: 'telemetry',
          csc: 'ATMCS',
          salindex: '0',
          topic: 'mount_AzEl_Encoders',
          item: 'elevationCalculatedAngle',
          type: 'line',
          accessor: '(x) => x[0]',
          ...defaultStyles[0],
        },
        'ATDome azimuth': {
          category: 'telemetry',
          csc: 'ATDome',
          salindex: '0',
          topic: 'position',
          item: 'azimuthPosition',
          type: 'line',
          accessor: '(x) => x',
          ...defaultStyles[1],
        },
      },
    },
    xAxisTitle: {
      type: 'string',
      description: 'Title of the horizontal axis of this plot',
      default: 'Time',
      isPrivate: false,
    },
    yAxisTitle: {
      type: 'string',
      description: 'Title of the vertical axis of this plot',
      default: '',
      isPrivate: false,
    },
    legendPosition: {
      type: 'string',
      description:
        "Whether to display the legend to the right of the plot or at the bottom. One of 'right' or 'bottom'",
      default: 'right',
      isPrivate: false,
    },
    controls: {
      type: 'boolean',
      description:
        "Whether to display controls to configure periods of time'",
      default: true,
      isPrivate: false,
    },
  },
};

class PlotContainer extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      data: {},
      isLive: true,
      timeWindow: 60,
      historicalData: [],
    }

    this.containerRef = React.createRef();
  }

  componentDidMount() {
    this.props.subscribeToStreams();
  }

  componentDidUpdate(prevProps, prevState) {
    const { timeSeriesControlsProps, inputs, streams, subscribeToStreams, unsubscribeToStreams } = this.props;
    const {data} = this.state;
    if (prevProps.timeSeriesControlsProps != timeSeriesControlsProps) {
      this.setState({ ...timeSeriesControlsProps });
    }

    if (prevProps.inputs != inputs || 
      prevProps.subscribeToStreams != subscribeToStreams ||
      prevProps.unsubscribeToStreams != unsubscribeToStreams) {
      unsubscribeToStreams();
      subscribeToStreams();
      const data = {};
      for (const key of Object.keys(inputs)) {
        data[key] = [];
      }
      this.setState({ data });      
    }

    if (prevProps.inputs != inputs || prevProps.streams != streams) {
      const newData = {};
      for (const [inputName, inputConfig] of Object.entries(inputs)) {
        const { category, csc, salindex, topic, item, accessor } = inputConfig;
        
        /* eslint no-eval: 0 */
        const accessorFunc = eval(accessor);
        let inputData = data[inputName] || [];
        const lastValue = inputData[inputData.length - 1];
        const streamName = `${category}-${csc}-${salindex}-${topic}`;
        if (!streams[streamName] || !streams[streamName]?.[item]) {
          continue;
        }
        const streamValue = Array.isArray(streams[streamName]) ? streams[streamName][0] : streams[streamName];
        const newValue = {
          name: inputName,
          x: parseTimestamp(streamValue.private_rcvStamp?.value * 1000),
          y: accessorFunc(streamValue[item]?.value),
        };
  
        // TODO: use reselect to never get repeated timestamps
        if ((!lastValue || lastValue.x?.ts !== newValue.x?.ts) && newValue.x) {
          inputData.push(newValue);
        }

        // if (inputData.length > 100) {
        //   inputData = inputData.slice(-100);
        // }
        newData[inputName] = inputData;
      }
      this.setState({ data: newData });
    }
  }

  render() {
    const { inputs, streams, containerNode, width, height, xAxisTitle, yAxisTitle, legendPosition,
      controls, timeSeriesControlsProps } = this.props;
    const { data } = this.state;

    const { isLive, timeWindow, historicalData } = timeSeriesControlsProps ?? this.state;

    const streamsItems = Object.entries(inputs).map(([_, inputConfig]) => {
      const { category, csc, salindex, topic, item } = inputConfig;
      const streamName = `${category}-${csc}-${salindex}-${topic}`;
      return streams[streamName]?.[item];
    });

    const units = streamsItems.find((item) => item?.units !== undefined && item?.units !== '')?.units;

    const layerTypes = ['lines', 'bars', 'pointLines']
    const layers = {};
    for (const [inputName, inputConfig] of Object.entries(inputs)) {
      const { type } = inputConfig;
      const typeStr = type + 's';
      if (!(layerTypes.includes(typeStr))) {
        continue;
      }

      if (!data[inputName]) continue;

      let rangedInputData;
      if (isLive) {
        rangedInputData = getRangedData(data[inputName], timeWindow);
      } else {
        rangedInputData = getRangedData(data[inputName], 0, historicalData);
      }
      // layers[typeStr] = (layers[typeStr] ?? []).concat(data[inputName]);
      layers[typeStr] = (layers[typeStr] ?? []).concat(rangedInputData);
    }

    const marksStyles = Object.keys(inputs).map((input, index) => {
      return {
        name: input,
        ...defaultStyles[index % defaultStyles.length],
        ...(inputs[input].color !== undefined ? { color: inputs[input].color } : {}),
        ...(inputs[input].dash !== undefined ? { dash: inputs[input].dash } : {}),
        ...(inputs[input].shape !== undefined ? { shape: inputs[input].shape } : {}),
        ...(inputs[input].filled !== undefined ? { filled: inputs[input].filled } : {}),
      };
    });

    const legend = Object.keys(inputs).map((inputName, index) => {
      return {
        label: inputName,
        name: inputName,
        markType: inputs[inputName].type,
      };
    });

    const plotProps = {
      layers: layers,
      legend: legend,
      marksStyles: marksStyles,
      xAxisTitle: xAxisTitle,
      yAxisTitle: yAxisTitle,
      units: units !== undefined ? { y: units } : undefined,
      temporalXAxis: true,
      width: width,
      height: height,
      legendPosition: legendPosition,
      isLive: isLive,
      timeWindow: timeWindow,
      setIsLive: isLive => { this.setState({ isLive })},
      setTimeWindow: timeWindow => { this.setState({ timeWindow })},
      setHistoricalData: historicalData => { this.setState({ historicalData })},
      controls: controls,
    };

    if (!width && !height && !containerNode) {
      return (
        <div ref={this.containerRef}>
          <Plot {...plotProps} containerNode={this.containerRef.current?.parentNode} />
        </div>
      );
    } else {
      return <Plot {...plotProps} containerNode={containerNode} />;
    }
  }
}

const getRangedData = (data, timeWindow, rangeArray) => {
  let filteredData;
  if (timeWindow == 0 && rangeArray?.length == 2){
    const range = moment.range(rangeArray);
    filteredData = data.filter(val => range.contains(val.x));
  } else {
    filteredData = data.filter(val => {
      const currentSeconds = new Date().getTime() / 1000;
      const dataSeconds = val.x.toMillis() / 1000;
      if ((currentSeconds - timeWindow * 60) <= dataSeconds) return true;
      else return false;
    });
  }
  return filteredData;
}

const getGroupNames = inputs => (
  Object.values(inputs).map(
    (inputConfig) => `${inputConfig?.category}-${inputConfig?.csc}-${inputConfig?.salindex}-${inputConfig?.topic}`,
  )
)

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    subscribeToStreams: () => {
      const inputs = ownProps.inputs || schema.props.inputs.default;
      const groupNames = getGroupNames(inputs);
      groupNames.forEach((groupName) => {
        dispatch(addGroup(groupName));
      });
    },
    unsubscribeToStreams: () => {
      const inputs = ownProps.inputs || schema.props.inputs.default;
      const groupNames = getGroupNames(inputs);
      groupNames.forEach((groupName) => {
        dispatch(requestGroupRemoval(groupName));
      });
    },
  };
};

const mapStateToProps = (state, ownProps) => {
  const inputs = ownProps.inputs || schema.props.inputs.default;
  const groupNames = getGroupNames(inputs);
  const streams = getStreamsData(state, groupNames);
  return {
    streams,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PlotContainer);
