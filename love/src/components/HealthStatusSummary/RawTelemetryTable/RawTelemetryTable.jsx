import React, { PureComponent } from 'react'
import styles from './RawTelemetryTable.module.css';
import StatusText from '../StatusText/StatusText';
import EditIcon from '../EditIcon/EditIcon';

export default class RawTelemetryTable extends PureComponent {
    constructor() {
        super();
        let data = {
            'scheduler': {
                'domeConfig': {
                    'timestamp': '2022/04/25 20:03:10',
                    'nParams': 3,
                    'parameters': [
                        {
                            'name': 'Altitude max speed',
                            'param_name': 'altitude_maxspeed',
                            'data_type': 'double',
                            'value': 1,
                            'units': 'm/s'
                        },
                        {
                            'name': 'Altitude acceleration',
                            'param_name': 'altitude_accel',
                            'data_type': 'double',
                            'value': [2, 5, 5, 6, 4, 5, 5, 6, 4, 8, 5, 3, 1, 5, 34, 8, 9, 6, 23, 4, 8, 3, 21, 8, 3, 2, 1, 6, 2, 5, 5, 6, 4, 5, 5, 6, 4, 8, 5, 3, 1, 5, 34, 8, 9, 6, 23, 4, 8, 3, 21, 8, 3, 2, 1, 6, 2, 5, 5, 6, 4, 5, 5, 6, 4, 8, 5, 3, 1, 5, 34, 8, 9, 6, 23, 4, 8, 3, 21, 8, 3, 2, 1, 6, 2, 5, 5, 6, 4, 5, 5, 6, 4, 8, 5, 3, 1, 5, 34, 8, 9, 6, 23, 4, 8, 3, 21, 8, 3, 2, 1, 6,],
                            'units': 'm/s²'
                        },
                        {
                            'name': 'Altitude deceleration',
                            'param_name': 'altitude_decel',
                            'data_type': 'double',
                            'value': 3,
                            'units': 'm/s²'
                        },
                    ]
                },
                'cloud': {
                    'timestamp': '2022/04/25 20:04:10',
                    'nParams': 2,
                    'parameters': [
                        {
                            'name': 'timestamp',
                            'param_name': 'timestamp',
                            'data_type': 'timestamp',
                            'value': '2022/04/25 10:04:10',
                            'units': 'YYYY/MM/DD HH:MM:SS'
                        },
                        {
                            'name': 'cloud',
                            'param_name': 'cloud',
                            'data_type': 'double',
                            'value': 2.0,
                            'units': '?'
                        },
                    ]
                },
            }
        }

        let filters = {
            'component': { 'type': 'regexp', 'value': (new RegExp('(?:)')) },
            'stream': { 'type': 'regexp', 'value': (new RegExp('(?:)')) },
            'timestamp': { 'type': 'regexp', 'value': (new RegExp('(?:)')) },
            'name': { 'type': 'regexp', 'value': (new RegExp('(?:)')) },
            'param_name': { 'type': 'regexp', 'value': (new RegExp('(?:)')) },
            'data_type': { 'type': 'regexp', 'value': (new RegExp('(?:)')) },
            'value': { 'type': 'regexp', 'value': (new RegExp('(?:)')) },
            'units': { 'type': 'regexp', 'value': (new RegExp('(?:)')) },
            'health_status': { 'type': 'health', 'value': (new RegExp('(?:)')) },
        }

        let healthFunctions = {
            'timestamp0': '//asdasdadsa',
            'altitude_decel0': '//dsasdssa\nreturn ALERT;',
            'altitude_accel0': 'return WARNING;',
            'altitude_maxspeed0': 'return OK;',
        }

        let parsedData = this.convertData(data);

        let expandedRows = {
            'altitude_maxspeed0': true,
        };

        this.state = {
            data: parsedData,
            filters: filters,
            healthFunctions: healthFunctions,
            expandedRows: expandedRows,
        };

        window.OK = 1;
        window.WARNING = 2;
        window.ALERT = 3;

        console.log(parsedData);
    }

    toggleRow = (rowId) => {
        let expandedRows = this.state.expandedRows;
        if (expandedRows[rowId])
            expandedRows[rowId] = false;
        else
            expandedRows[rowId] = true;
        this.setState({
            expandedRows: { ...expandedRows },
        })
    }

    convertData = (data) => {
        let newData = [];
        for (let i = 0; i < Object.keys(data).length; i++) {
            let component = data[Object.keys(data)[i]];
            let componentName = Object.keys(data)[i];
            for (let j = 0; j < Object.keys(component).length; j++) {
                let telemetryStream = component[Object.keys(component)[j]];
                let telemetryStreamName = Object.keys(component)[j];
                let streamTimestamp = telemetryStream['timestamp'];
                let parameters = telemetryStream['parameters'];
                for (let k = 0; k < parameters.length; k++) {
                    let parameter = parameters[k];
                    for (let n = 0; n < 10; n++)
                        newData.push({//change to fixed length
                            'component': componentName,
                            'stream': telemetryStreamName,
                            'timestamp': streamTimestamp,
                            'name': parameter['name'],
                            'param_name': parameter['param_name'] + n,
                            'data_type': parameter['data_type'],
                            'value': parameter['value'],
                            'units': parameter['units'],
                            'health_status': (value) => 'Not defined',
                        })
                }
            }
        }
        return newData;
    }

    testFilter = (row) => {
        let values = Object.keys(row).map((rowKey) => {
            if (this.state.filters[rowKey].type === 'regexp')
                return this.state.filters[rowKey].value.test(row[rowKey]);
            if (this.state.filters[rowKey].type === 'health') {
                let healthStatus = this.getHealthText(this.getHealthStatusCode(row.param_name, row.value));
                return this.state.filters[rowKey].value.test(healthStatus);
            }
            return true;
        });
        let value = values.reduce((a, b) => a && b, true);
        return value;
    }

    changeFilter = (column) => {
        return (event) => {
            let filters = { ...this.state.filters };
            filters[column].value = new RegExp(event.target.value, 'i');
            this.setState({
                filters: filters
            })
        }
    }

    getHealthStatusCode = (param_name, value) => {
        let statusCode = 0;
        if (this.state.healthFunctions[param_name]) {
            try {
                // eslint-disable-next-line
                let user_func = new Function("value", this.state.healthFunctions[param_name]);
                statusCode = user_func(value);
            } catch (err) {
                statusCode = -1;
                console.log('Error parsing custom function');
                console.log(err);
            }
        }
        return statusCode;
    }

    getHealthText = (statusCode) => {
        if (statusCode === 0)
            return 'Undefined';
        if (statusCode === 1)
            return 'OK';
        if (statusCode === 2)
            return 'Warning';
        if (statusCode === 3)
            return 'Alert';
        return 'Invalid';
    }

    setHealthFunction = (param_name) => {
        console.log(param_name + '-healthFuncion')
        let healthFunctions = this.state.healthFunctions;
        healthFunctions[param_name] = document.getElementById(param_name + '-healthFunction').value;
        this.setState({
            healthFunctions: { ...healthFunctions },
        })
    }

    displayHealthFunction = (param_name, functionType) => {
        let textArea = document.getElementById(param_name + '-healthFunction');
        let text = '';
        if (functionType === 'text')
            text = 'if(value === <targetValue>)\n    return ALERT;';
        if (functionType === 'range')
            text = 'if(value > <targetValue1>)\n    return WARNING;\nif(value > <targetValue1>)\n    return ALERT;\n return OK\n';
        textArea.value = text;
        return 0;
    }

    render() {
        const { data } = this.state;
        return (
            <table className={styles.rawTelemetryTable}>
                <tbody>
                    <tr>
                        <th>Component</th>
                        <th>Stream</th>
                        <th>Timestamp</th>
                        <th>Name</th>
                        <th>Parameter</th>
                        <th>Data type</th>
                        <th>Value</th>
                        <th>Units</th>
                        <th>Health status</th>
                    </tr>
                    <tr>
                        <td><input type="text" onChange={this.changeFilter('component')} /></td>
                        <td><input type="text" onChange={this.changeFilter('stream')} /></td>
                        <td><input type="text" onChange={this.changeFilter('timestamp')} /></td>
                        <td><input type="text" onChange={this.changeFilter('name')} /></td>
                        <td><input type="text" onChange={this.changeFilter('param_name')} /></td>
                        <td><input type="text" onChange={this.changeFilter('data_type')} /></td>
                        <td><input type="text" onChange={this.changeFilter('value')} /></td>
                        <td><input type="text" onChange={this.changeFilter('units')} /></td>
                        <td><input type="text" onChange={this.changeFilter('health_status')} /></td>
                    </tr>
                    {
                        data.map((row) => {
                            // console.log('this.getHealthStatusCode', row.param_name, row.value, this.getHealthStatusCode(row.param_name, row.value))
                            if (this.testFilter(row)) {
                                return (
                                    <React.Fragment key={row.param_name}>
                                        <tr className={styles.dataRow} onClick={() => this.toggleRow(row.param_name)} key={row.param_name + '-row'}>
                                            <td>{row.component}</td>
                                            <td>{row.stream}</td>
                                            <td>{row.timestamp}</td>
                                            <td>{row.name}</td>
                                            <td>{row.param_name}</td>
                                            <td>{row.data_type}</td>
                                            <td className={styles.valueCell}>{JSON.stringify(row.value)}</td>
                                            <td>{row.units}</td>
                                            <td className={styles.healthStatusCell}>
                                                <div className={styles.healthStatusWrapper}>
                                                    <div className={styles.statusTextWrapper}>
                                                        <StatusText statusCode={this.getHealthStatusCode(row.param_name, row.value)} getHealthText={this.getHealthText}>
                                                        </StatusText>
                                                    </div>
                                                    <div className={styles.editIconWrapper}>
                                                        <EditIcon active></EditIcon>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                        {
                                            (this.state.expandedRows[row.param_name]) ?
                                                <tr key={row.param_name + '-expanded'} className={styles.expandedRow}>
                                                    <td colSpan={9}>
                                                        <div>
                                                            <div>
                                                                <p>
                                                                    {'function ( value ) {'}
                                                                </p>
                                                                <textarea id={row.param_name + '-healthFunction'} defaultValue={this.state.healthFunctions[row.param_name]}>
                                                                </textarea>
                                                                <p>
                                                                    {'}'}
                                                                </p>
                                                                <button onClick={() => this.setHealthFunction(row.param_name)}>Set</button>
                                                            </div>
                                                            <div>
                                                                <ul>
                                                                    <li>
                                                                        <span onClick={() => this.displayHealthFunction(row.param_name, 'range')}>Range</span>
                                                                    </li>
                                                                    <li>
                                                                        <span onClick={() => this.displayHealthFunction(row.param_name, 'text')}>Text value</span>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                            <div>
                                                                <span>{JSON.stringify(row.value)}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr> :
                                                null
                                        }
                                    </React.Fragment>
                                )
                            }
                            return null;
                        })
                    }
                </tbody>
            </table>
        );
    }
}
