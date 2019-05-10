import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styles from './RawTelemetryTable.module.css';
import StatusText from '../../GeneralPurpose/StatusText/StatusText';
import GearIcon from '../../icons/GearIcon/GearIcon';
import Button from '../../GeneralPurpose/Button/Button';
import fakeData from './fakeData';
import ColumnHeader from './ColumnHeader/ColumnHeader';
import TelemetrySelectionTag from './TelemetrySelectionTag/TelemetrySelectionTag';
import { getFakeUnits } from '../../../Utils';

/**
 * Configurable table displaying an arbitrary subset
 * of telemetries provided in the component props. It has an optional selection column
 * to be used as a telemetry selection feature. along with the filtering and sorting methods.
 * By pressing the Set button, the list of telemetries is passed to a callback function in the component props.
 *
 */
export default class RawTelemetryTable extends PureComponent {
  static propTypes = {
    /** Display the selection column or not */
    columnsToDisplay: PropTypes.arrayOf(
      PropTypes.oneOf([
        'selection_column',
        'component',
        'stream',
        'timestamp',
        'name',
        'param_name',
        'data_type',
        'value',
        'units',
        'health_status',
      ]),
    ),
    /** Column to use to restrict values when selecting a row, such as limiting only selection of rows with the same units */
    checkedFilterColumn: PropTypes.oneOf([
      'component',
      'stream',
      'timestamp',
      'name',
      'param_name',
      'data_type',
      'value',
      'units',
    ]),
    /** Dictionary containing the definition of healthStatus functions. Keys are a concatenation of component, stream, param_name
        separated by a dash. Values are javascript code as text */
    healthFunctions: PropTypes.object,
    /** Function called to set healthStatus functions. It receives a dictionary containing the healthStatus functions to be set */
    setHealthFunctions: PropTypes.func,
    /** Dictionary of telemetries that are displayed. See examples below */
    telemetries: PropTypes.object,
    /** Function called when the "Set" button is clicked. It receives the list of keys of the selected rows and the onClick event object of the associated `<button>` */
    onSetSelection: PropTypes.func,
  };

  static defaultProps = {
    onSetSelection: () => {},
    columnsToDisplay: [
      'selection_column',
      'component',
      'stream',
      'timestamp',
      'name',
      'param_name',
      'data_type',
      'value',
      'units',
      'health_status',
    ],
  };

  constructor() {
    super();

    const expandedRows = {
      altitude_maxspeed0: true,
    };

    this.defaultCodeText =
      "// Function should return one of the following global variables:\n// ALERT, WARNING, OK. I.e. 'return OK'";
    this.healthStatusCodes = {
      0: 'Undefined',
      1: 'OK',
      2: 'Warning',
      3: 'Alert',
      4: 'Invalid',
    };
    this.healthStatusPriorities = {
      3: 5,
      2: 4,
      1: 3,
      4: 2,
      0: 1,
    };
    window.OK = 1;
    window.WARNING = 2;
    window.ALERT = 3;

    const filters = {
      component: { type: 'regexp', value: new RegExp('(?:)') },
      stream: { type: 'regexp', value: new RegExp('(?:)') },
      timestamp: { type: 'regexp', value: new RegExp('(?:)') },
      name: { type: 'regexp', value: new RegExp('(?:)') },
      param_name: { type: 'regexp', value: new RegExp('(?:)') },
      data_type: { type: 'regexp', value: new RegExp('(?:)') },
      value: { type: 'regexp', value: new RegExp('(?:)') },
      units: { type: 'regexp', value: new RegExp('(?:)') },
      health_status: { type: 'health', value: new RegExp('(?:)') },
    };

    this.state = {
      expandedRows,
      activeFilterDialog: 'None',
      sortingColumn: 'stream',
      sortDirection: 'ascending',
      selectedRows: [],
      filters,
      setFilters: this.setFilters,
    };
  }

  setFilters = (filters) => {
    Object.keys(filters).map((key) => {
      if (filters[key].type === 'regexp' && typeof filters[key].value === 'string') {
        // eslint-disable-next-line
        filters[key].value = new RegExp(filters[key].value.replace(/^\/|\/$/g, ''));
      }
      return null;
    });
    this.setState({
      filters,
    });
  };

  clickRow = () => {
    this.closeFilterDialogs();
  };

  clickGearIcon = (rowID) => {
    this.toggleRow(rowID);
  };

  toggleRow = (rowId) => {
    this.closeFilterDialogs();
    let { expandedRows } = this.state;
    if (expandedRows[rowId]) expandedRows[rowId] = false;
    else {
      expandedRows = {};
      expandedRows[rowId] = true;
    }
    this.setState({
      expandedRows: { ...expandedRows },
    });
  };

  convertData = (data) => {
    const newData = [];
    for (let i = 0; i < Object.keys(data).length; i += 1) {
      const component = data[Object.keys(data)[i]];
      const componentName = Object.keys(data)[i];
      for (let j = 0; j < Object.keys(component).length; j += 1) {
        const telemetryStream = component[Object.keys(component)[j]];
        const telemetryStreamName = Object.keys(component)[j];
        const streamTimestamp = telemetryStream.timestamp;
        const { parameters } = telemetryStream;
        for (let k = 0; k < parameters.length; k += 1) {
          const parameter = parameters[k];
          newData.push({
            // change to fixed length
            component: componentName,
            stream: telemetryStreamName,
            timestamp: streamTimestamp,
            name: parameter.name,
            param_name: parameter.param_name,
            data_type: parameter.data_type,
            value: parameter.value,
            units: parameter.units,
            health_status: () => 'Not defined',
          });
        }
      }
    }
    return newData;
  };

  testFilter = (row) => {
    const values = Object.keys(row).map((rowKey) => {
      const key = [row.component, row.stream, row.param_name].join('-');
      if (this.state.filters[rowKey] !== undefined && this.state.filters[rowKey].type === 'regexp') {
        const regexpFilterResult = this.state.filters[rowKey].value.test(row[rowKey]);
        let checkedFilterResult = true;
        if (this.state.checkedFilter && this.state.checkedFilter[rowKey]) {
          checkedFilterResult = this.state.checkedFilter[rowKey].test(row[rowKey]);
        }
        return regexpFilterResult && checkedFilterResult;
      }
      if (this.state.filters[rowKey] !== undefined && this.state.filters[rowKey].type === 'health') {
        let healthStatus = 0;
        if (this.props.healthFunctions !== undefined) {
          healthStatus = this.getHealthText(this.getHealthStatusCode(key, row.value));
        }
        return this.state.filters[rowKey].value.test(healthStatus);
      }
      return true;
    });
    const value = values.reduce((a, b) => a && b, true);
    return value;
  };

  changeFilter = (column) => (event) => {
    const filters = { ...this.state.filters };
    filters[column].value = new RegExp(event.target.value, 'i');
    this.state.setFilters(filters);
  };

  getHealthStatusCode = (paramName, value) => {
    let statusCode = 0;
    if (this.props.healthFunctions[paramName]) {
      try {
        // eslint-disable-next-line
        let user_func = new Function('value', this.props.healthFunctions[paramName]);
        statusCode = user_func(value);
      } catch (err) {
        statusCode = 4;
        // console.log('Error parsing custom function');
        // console.log(err);
      }
    }
    return statusCode;
  };

  getHealthText = (statusCode) => {
    let parsedStatusCode = statusCode;
    if (statusCode === undefined) parsedStatusCode = 0;
    return this.healthStatusCodes[parsedStatusCode];
  };

  setHealthFunction = (paramName) => {
    const { healthFunctions } = this.props;
    healthFunctions[paramName] = document.getElementById(`${paramName}-healthFunction`).value;
    this.props.setHealthFunctions(healthFunctions);
    localStorage.setItem('healthFunctions', JSON.stringify(healthFunctions));
    this.toggleRow(paramName);
  };

  displayHealthFunction = (paramName, functionType) => {
    const textArea = document.getElementById(`${paramName}-healthFunction`);
    let text = '';
    if (functionType === 'text') text = 'if(value === <targetValue>)\n    return ALERT;';
    if (functionType === 'range') {
      text =
        'if(value > <targetValue1>)\n    return WARNING;\nif(value > <targetValue1>)\n    return ALERT;\n return OK\n';
    }
    textArea.value = text;
    return 0;
  };

  renderValueAsList = (values) => {
    const elements = values.map((elem, index) => (
      <li key={index} className={styles.valuesListItem}>
        <span className={styles.valuesListItemValue}>{JSON.stringify(elem)}</span>
      </li>
    ));
    return <ol className={styles.valuesList}>{elements}</ol>;
  };

  columnOnClick = (ev, filterName) => {
    if (this.state.activeFilterDialog === filterName) {
      this.closeFilterDialogs();
      return;
    }
    this.setState({ activeFilterDialog: filterName });
  };

  closeFilterDialogs = () => {
    this.setState({ activeFilterDialog: 'None' });
  };

  changeSortDirection = (direction, column) => {
    /*
            direction can be "ascending" or "descending", otherwise no
            sorting will be applied
            Sorting is applied before filtering
        */
    this.setState({ sortDirection: direction, sortingColumn: column });
  };

  sortData = (a, b) => {
    const direction = this.state.sortDirection === 'ascending' ? 1 : -1;
    const aKey = [a.component, a.stream, a.param_name].join('-');
    const bKey = [b.component, b.stream, b.param_name].join('-');
    const selectedKeys = this.state.selectedRows.map((r) => r.key);
    const column = this.state.sortingColumn;
    if (selectedKeys.indexOf(aKey) > -1 && !(selectedKeys.indexOf(bKey) > -1)) {
      return -1;
    }
    if (selectedKeys.indexOf(bKey) > -1 && !(selectedKeys.indexOf(aKey) > -1)) return 1;

    if (column === 'health_status') {
      const aValue = this.healthStatusPriorities[a.healthStatusCode];
      const bValue = this.healthStatusPriorities[b.healthStatusCode];
      return aValue < bValue ? -direction : direction;
    }
    return a[column] <= b[column] ? -direction : direction;
  };

  setCheckedFilterColumn = (column, value) => {
    if (column === undefined || value === undefined) {
      this.setState({
        checkedFilter: undefined,
      });
      return;
    }
    const checkedFilter = {};
    checkedFilter[column] = new RegExp(value, 'i');
    this.setState({
      checkedFilter,
    });
  };

  updateSelectedList = (checked, key) => {
    const splitKey = key.split('-');
    const params = this.props.telemetries[splitKey[0]][splitKey[1]].parameters;
    const value = params[splitKey[2]];
    const { selectedRows } = this.state;
    const newRow = {
      key,
      value,
    };
    if (checked && selectedRows.indexOf(key) < 0) selectedRows.push(newRow);
    if (!checked) selectedRows.splice(selectedRows.map((row) => row.key).indexOf(key), 1);
    if (selectedRows.length === 0) this.setCheckedFilterColumn();
    this.setState({
      selectedRows: [...selectedRows],
    });
  };

  selectAllRows = (checked) => {
    const data = this.getData();
    data.sort(this.sortData).map((row) => {
      if (this.testFilter(row)) {
        const key = [row.component, row.stream, row.param_name].join('-');
        this.onRowSelection(checked, key, row);
      }
      return true;
    });
  };

  onRowSelection = (checked, key, row) => {
    const { checkedFilterColumn } = this.props;
    if (row[checkedFilterColumn] !== undefined) {
      const value = row[checkedFilterColumn].replace(/[-[\]{}()*+!<=:?./\\^$|#\s,]/g, '\\$&');
      this.setCheckedFilterColumn(checkedFilterColumn, value);
    }
    this.updateSelectedList(checked, key);
  };

  getData = () => {
    let data = Object.assign({}, fakeData); // load "fake" data as template;
    const telemetryCSCs = Object.keys(this.props.telemetries); // the raw telemetry as it comes from the manager
    telemetryCSCs.forEach((telemetryCSC) => {
      data[telemetryCSC] = {};
      // look at one telemetry
      const streamsData = this.props.telemetries[telemetryCSC];
      const streamKeys = Object.keys(streamsData);
      streamKeys.forEach((streamKey) => {
        const streamData = streamsData[streamKey];
        data[telemetryCSC][streamKey] = {
          timestamp: streamData.receptionTimestamp,
          parameters: Object.entries(streamData.parameters).map((parameter) => {
            // look at one parameter
            const [name, measurement, units] = parameter;

            return {
              name,
              param_name: name,
              data_type: measurement.dataType ? measurement.dataType : '?',
              value: measurement.value,
              units: units || getFakeUnits(name),
            };
          }),
        };
      });
    }, this);

    data = this.convertData(data);
    return data;
  };

  setSelection = (event) => {
    this.props.onSetSelection(this.state.selectedRows, event);
  };

  render() {
    const displayHeaderCheckbock = this.props.checkedFilterColumn === undefined;
    let data = this.getData();
    if (this.props.healthFunctions !== undefined) {
      data = data.map((row) => {
        const key = [row.component, row.stream, row.param_name].join('-');
        return {
          healthStatusCode: this.getHealthStatusCode(key, row.value),
          ...row,
        };
      });
    }
    return (
      <div className={styles.rawTelemetryTableWrapper}>
        <table className={styles.rawTelemetryTable}>
          <thead>
            <tr>
              {this.props.columnsToDisplay.includes('selection_column') ? (
                <th
                  className={[
                    styles.addedColumn,
                    styles.firstColumn,
                    styles.checkboxCell,
                    displayHeaderCheckbock ? '' : styles.hidden,
                  ].join(' ')}
                >
                  <input
                    type="checkbox"
                    alt={'select all telemetries'}
                    onChange={(event) => this.selectAllRows(event.target.checked)}
                  />
                </th>
              ) : null}
              {(() => {
                const defaultColumnProps = {
                  changeFilter: this.changeFilter,
                  activeFilterDialog: this.state.activeFilterDialog,
                  closeFilterDialogs: this.closeFilterDialogs,
                  columnOnClick: this.columnOnClick,
                  changeSortDirection: this.changeSortDirection,
                  sortDirection: this.state.sortDirection,
                  sortingColumn: this.state.sortingColumn,
                };

                return (
                  <>
                    {this.props.columnsToDisplay.includes('component') && (
                      <ColumnHeader
                        {...defaultColumnProps}
                        header={'Component'}
                        filterName={'component'}
                        filter={this.state.filters.component}
                      />
                    )}
                    {this.props.columnsToDisplay.includes('stream') && (
                      <ColumnHeader
                        {...defaultColumnProps}
                        header={'Stream'}
                        filterName={'stream'}
                        filter={this.state.filters.stream}
                      />
                    )}
                    {this.props.columnsToDisplay.includes('timestamp') && (
                      <ColumnHeader
                        {...defaultColumnProps}
                        header={'Timestamp'}
                        filterName={'timestamp'}
                        filter={this.state.filters.timestamp}
                        secondaryText={'YYYY/MM/DD'}
                      />
                    )}
                    {this.props.columnsToDisplay.includes('name') && (
                      <ColumnHeader
                        {...defaultColumnProps}
                        header={'Name'}
                        filterName={'name'}
                        filter={this.state.filters.name}
                      />
                    )}
                    {this.props.columnsToDisplay.includes('param_name') && (
                      <ColumnHeader
                        {...defaultColumnProps}
                        header={'Parameter'}
                        filterName={'param_name'}
                        filter={this.state.filters.param_name}
                      />
                    )}
                    {this.props.columnsToDisplay.includes('data_type') && (
                      <ColumnHeader
                        className={styles.mediumCol}
                        {...defaultColumnProps}
                        header={'Data type'}
                        filterName={'data_type'}
                        filter={this.state.filters.data_type}
                      />
                    )}
                    {this.props.columnsToDisplay.includes('value') && (
                      <ColumnHeader
                        {...defaultColumnProps}
                        header={'Value'}
                        filterName={'value'}
                        filter={this.state.filters.value}
                      />
                    )}
                    {this.props.columnsToDisplay.includes('units') && (
                      <ColumnHeader
                        className={styles.narrowCol}
                        {...defaultColumnProps}
                        header={'Units'}
                        filterName={'units'}
                        filter={this.state.filters.units}
                      />
                    )}
                    {this.props.columnsToDisplay.includes('health_status') && (
                      <ColumnHeader
                        {...defaultColumnProps}
                        header={'Health status'}
                        filterName={'health_status'}
                        filter={this.state.filters.health_status}
                      />
                    )}
                  </>
                );
              })()}
            </tr>
          </thead>
          <tbody onClick={this.closeFilterDialogs}>
            {data.sort(this.sortData).map((row) => {
              if (this.testFilter(row)) {
                const key = [row.component, row.stream, row.param_name].join('-');
                const isChecked = this.state.selectedRows.map((r) => r.key).indexOf(key) >= 0;

                return (
                  <React.Fragment key={key}>
                    <tr className={styles.dataRow} onClick={() => this.clickRow(key)}>
                      {this.props.columnsToDisplay.includes('selection_column') ? (
                        <td className={[styles.firstColumn, styles.checkboxCell].join(' ')}>
                          <input
                            onChange={(event) => this.onRowSelection(event.target.checked, key, row)}
                            type="checkbox"
                            alt={`select ${key}`}
                            checked={isChecked}
                          />
                        </td>
                      ) : null}
                      {this.props.columnsToDisplay.includes('component') && (
                        <td className={styles.string}>{row.component}</td>
                      )}
                      {this.props.columnsToDisplay.includes('stream') && (
                        <td className={styles.string}>{row.stream}</td>
                      )}
                      {this.props.columnsToDisplay.includes('timestamp') && (
                        <td className={styles.string}>{row.timestamp}</td>
                      )}
                      {this.props.columnsToDisplay.includes('name') && <td className={styles.string}>{row.name}</td>}
                      {this.props.columnsToDisplay.includes('param_name') && (
                        <td className={styles.string}>{row.param_name}</td>
                      )}
                      {this.props.columnsToDisplay.includes('data_type') && (
                        <td className={[styles.string, styles.mediumCol].join(' ')}>{row.data_type}</td>
                      )}
                      {this.props.columnsToDisplay.includes('value') && (
                        <td className={[styles.number, styles.valueCell].join(' ')}>{JSON.stringify(row.value)}</td>
                      )}
                      {this.props.columnsToDisplay.includes('units') && (
                        <td className={[styles.string, styles.narrowCol].join(' ')}>{row.units}</td>
                      )}
                      {this.props.columnsToDisplay.includes('health_status') && (
                        <td
                          className={[
                            styles.healthStatusCell,
                            this.state.expandedRows[key] ? styles.selectedHealthStatus : '',
                          ].join(' ')}
                          key={`${key}-row`}
                        >
                          <div className={styles.healthStatusWrapper}>
                            <div className={styles.statusTextWrapper}>
                              <StatusText
                                status={
                                  this.healthStatusCodes[row.healthStatusCode]
                                    ? this.healthStatusCodes[row.healthStatusCode].toLowerCase()
                                    : ''
                                }
                              >
                                {this.getHealthText(row.healthStatusCode)}
                              </StatusText>
                            </div>
                            <div onClick={() => this.clickGearIcon(key)} className={styles.gearIconWrapper}>
                              <GearIcon active={this.state.expandedRows[key]} />
                            </div>
                          </div>
                        </td>
                      )}
                    </tr>
                    {this.state.expandedRows[key] ? (
                      <tr onClick={this.closeFilterDialogs} key={`${key}-expanded`} className={styles.expandedRow}>
                        <td colSpan={4}>
                          <div>
                            <p>Value</p>
                            {row.value.length > 1
                              ? this.renderValueAsList(row.value)
                              : this.renderValueAsList([row.value])}
                          </div>
                        </td>
                        <td colSpan={4}>
                          <div>
                            <p>{'function ( value ) {'}</p>
                            <textarea
                              id={`${key}-healthFunction`}
                              defaultValue={
                                this.props.healthFunctions[key] ? this.props.healthFunctions[key] : this.defaultCodeText
                              }
                            />
                            <p>{'}'}</p>
                            <div onClick={() => this.setHealthFunction(key)}>
                              <Button title="Set health status function" className={styles.setButton}>
                                Set
                              </Button>
                            </div>
                          </div>
                        </td>
                        <td colSpan={1}>
                          <div>
                            <div className={styles.snippetsContainer}>
                              <p className={styles.lineJump}> </p>

                              <div className={styles.snippetsTitle}>Snippets</div>
                              <div className={styles.snippetsList}>
                                <div className={styles.snippetButtonWrapper}>
                                  <Button secondary className={styles.snippetButton}>
                                    <span onClick={() => this.displayHealthFunction(key, 'range')}>Range</span>
                                  </Button>
                                </div>
                                <div className={styles.snippetButtonWrapper}>
                                  <Button secondary className={styles.snippetButton}>
                                    <span onClick={() => this.displayHealthFunction(key, 'text')}>Text value</span>
                                  </Button>
                                </div>
                              </div>

                              <div className={styles.statusConfigTitle}> Available Status:</div>
                              <div className={styles.statusList}>
                                <div> OK</div>
                                <div> WARNING</div>
                                <div> ALERT</div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                );
              }
              return null;
            })}
          </tbody>
        </table>

        <div className={styles.selectionContainer}>
          TELEMETRIES:
          <span className={styles.selectionList}>
            {this.state.selectedRows.map((telemetryKeyValue) => {
              const telemetryKey = telemetryKeyValue.key;
              const telemetryName = telemetryKey.split('-')[2];
              return (
                <TelemetrySelectionTag
                  key={telemetryKey}
                  telemetryKey={telemetryKey}
                  telemetryName={telemetryName}
                  remove={() => this.updateSelectedList(false, telemetryKey)}
                />
              );
            })}
          </span>
          <Button
            title="Set selected telemetries"
            className={styles.selectionSetButton}
            onClick={(ev) => {
              this.setSelection(this.state.selectedRows, ev);
            }}
          >
            {' '}
            Set{' '}
          </Button>
        </div>
      </div>
    );
  }
}
