import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './DMFlow.module.css';
import { dmFlowStatusMap, stateToStyleDMFlow } from 'Config';
import PaginatedTable from 'components/GeneralPurpose/PaginatedTable/PaginatedTable';
import StatusText from 'components/GeneralPurpose/StatusText/StatusText';
import Info from './InfoDMFlow/Info';
import Pipeline from './icons/Pipeline';

let dataMock = [];
for (let i = 1; i < 100; i++) {
  dataMock.push({
    thumbnail: 'img',
    imageName: 'CC_O_200202_000' + i.toString(),
    state: Math.floor(Math.random() * 10),
    status: Math.floor(Math.random() * 7),
  });
}

let schema = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  width: 300,
  height: 200,
  data: { url: 'data/unemployment-across-industries.json' },
  mark: 'area',
  encoding: {
    x: {
      timeUnit: 'yearmonth',
      field: 'date',
      axis: { format: '%Y' },
    },
    y: {
      aggregate: 'sum',
      field: 'count',
      title: 'count',
    },
  },
};
export default class DMFlow extends Component {
  static propTypes = {
    nombre: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount = () => {};

  render() {
    const headers = [
      {
        field: 'thumbnail',
        title: 'Thumbnail',
        type: 'string',
      },
      {
        field: 'imageName',
        title: 'Image Name',
        type: 'string',
      },
      {
        field: 'state',
        title: 'Pipeline',
        // render: (value) => {
        //   return Math.round(value * 100) / 100;
        // },
      },
      {
        field: 'textStatus',
        title: 'Status',
        render: (value) => {
          return (
            <StatusText small status={stateToStyleDMFlow[value]}>
              {value}
            </StatusText>
          );
        },
      },
    ];

    dataMock.map((value) => {
      value.textStatus = dmFlowStatusMap[value.status];
    });

    return (
      <div className={styles.container}>
        <div>
          {/* <Info></Info> */}
          <Pipeline></Pipeline>
        </div>

        <PaginatedTable headers={headers} data={dataMock}></PaginatedTable>
      </div>
    );
  }
}
