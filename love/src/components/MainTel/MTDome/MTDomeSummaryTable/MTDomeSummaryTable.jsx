import React, { Component } from 'react';
import styles from './MTDomeSummaryTable.module.css';
import StatusText from '../../../GeneralPurpose/StatusText/StatusText';
import CurrentTargetValue from '../../../GeneralPurpose/CurrentTargetValue/CurrentTargetValue';
import PropTypes from 'prop-types';
import {
  domeAzimuthStateMap,
  dropoutDoorStateMap,
  mainDoorStateMap,
  mountTrackingStateMap,
  stateToStyleDomeAndMount,
} from '../../../../Config';
import Limits from '../../../GeneralPurpose/Limits/Limits';
import SummaryPanel from '../../../GeneralPurpose/SummaryPanel/SummaryPanel';
import Row from '../../../GeneralPurpose/SummaryPanel/Row';
import Label from '../../../GeneralPurpose/SummaryPanel/Label';
import Value from '../../../GeneralPurpose/SummaryPanel/Value';
import Title from '../../../GeneralPurpose/SummaryPanel/Title';
import ProgressBar from '../../../GeneralPurpose/ProgressBar/ProgressBar';
import {
  mtDomeModeStateMap,
  mtDomeModeStatetoStyle,
  mtDomeAzimuthEnabledStateMap,
  mtDomeAzimuthEnabledStatetoStyle,
  mtdomeAzimuthMotionStateMap,
  mtdomeAzimuthMotionStatetoStyle,
  mtdomeElevationEnabledStateToMap,
  mtdomeElevationEnabledStatetoStyle,
  mtdomeElevationMotionStateToMap,
  mtdomeElevationMotionStatetoStyle,
} from '../../../../Config';

export default class DomeSummaryTable extends Component {
  static propTypes = {};

  static defaultProps = {};

  render() {
    // Replace them for the correct MTDome subscriptions. This was added for first testing purposes only.

    const modeDomeStatus = mtDomeModeStateMap[this.props.modeDomeStatus];
    const azimuthDomeState = mtDomeAzimuthEnabledStateMap[this.props.azimuthDomeState];
    const azimuthDomeMotion = mtdomeAzimuthMotionStateMap[this.props.azimuthDomeMotion];
    const elevationDomeState = mtdomeElevationEnabledStateToMap[this.props.elevationDomeState];
    const elevationDomeMotion = mtdomeElevationMotionStateToMap[this.props.elevationDomeMotion];

    // const domeInPositionLabel = domeInPositionValue ? 'IN POSITION' : 'NOT IN POSITION';
    // const mountInPositionLabel = mountInPositionValue ? 'IN POSITION' : 'NOT IN POSITION';
    return (
      <div className={styles.divSummary}>
        <SummaryPanel className={styles.summaryTable}>
          <Title>Track ID</Title>
          <Value>{this.props.trackID ?? 0.0}</Value>
          {/* Dome */}
          <Title>Dome</Title>
          <Value>
            <StatusText>{'undefined'}</StatusText>
          </Value>

          {/* <Label>Compensation</Label>
            <Value>
              <StatusText status={hexapodCompensationModeStatetoStyle[compensationStatus]}>
                {compensationStatus}
              </StatusText>
            </Value> */}

          <Label>Mode</Label>
          <Value>
            <StatusText status={mtDomeModeStatetoStyle[modeDomeStatus]}>{modeDomeStatus}</StatusText>
          </Value>
          <Label>Azimuth</Label>
          <Value>
            <StatusText status={mtDomeAzimuthEnabledStatetoStyle[azimuthDomeState]}>{azimuthDomeState}</StatusText>
          </Value>
          <Label>
            <CurrentTargetValue
              currentValue={this.props.positionActualAz}
              targetValue={this.props.azimuthDomeTarget}
              isChanging={true}
            />
          </Label>
          <Value>
            <StatusText status={mtdomeAzimuthMotionStatetoStyle[azimuthDomeMotion]}>{azimuthDomeMotion}</StatusText>
          </Value>
          <Row
          // title={`Current value: ${50}\nTarget value: ${mountAz.target}\nLimits: [${minAz}º, ${maxAz}º]`}
          >
            <span>
              <Limits
                lowerLimit={50}
                upperLimit={135}
                currentValue={60}
                targetValue={180}
                height={30}
                displayLabels={false}
              />
            </span>
            <span>
              <span>Time to limit: </span>
              <span className={styles.highlight}>{Math.round(165)} min</span>
            </span>
          </Row>
          <Label>Elevation</Label>
          <Value>
            <StatusText status={mtdomeElevationEnabledStatetoStyle[elevationDomeState]}>
              {elevationDomeState}
            </StatusText>
          </Value>
          <Label>
            <CurrentTargetValue
              currentValue={this.props.positionActualLightWindScreen}
              targetValue={this.props.positionCommandedLightWindScreen}
              isChanging={true}
            />
          </Label>
          <Value>
            <StatusText status={mtdomeElevationMotionStatetoStyle[elevationDomeMotion]}>
              {elevationDomeMotion}
            </StatusText>
          </Value>
          <Row
          // title={`Current value: ${mountEl.current}\nTarget value: ${mountEl.target}\nLimits: [${minEl}º, ${maxEl}º]`}
          >
            <span>
              <Limits
                lowerLimit={75}
                upperLimit={149}
                currentValue={60}
                targetValue={85}
                height={30}
                displayLabels={false}
              />
            </span>
            <span>
              <span>Time to limit: </span>
              <span className={styles.highlight}>{Math.round(130)} min</span>
            </span>
          </Row>
        </SummaryPanel>
        <SummaryPanel className={styles.shutters}>
          <SummaryPanel>
            <Label>Shutters</Label>
          </SummaryPanel>
          <div className={styles.divProgressBars}>
            <ProgressBar
              targetValueX={this.props.positionCommandedShutter}
              completed={this.props.positionActualShutter}
            />
            <ProgressBar
              targetValueX={this.props.positionCommandedShutter}
              completed={this.props.positionActualShutter}
            />
            {/* <div className={styles.actualShutter}>
              <span>{this.props.positionActualShutter}</span>
              <div className={styles.limits}>
                <Limits
                  lowerLimit={0}
                  upperLimit={100}
                  currentValue={this.props.positionActualShutter}
                  targetValue={this.props.positionCommandedShutter}
                  height={30}
                  displayLabels={false}
                  limitWarning={0}
                />
              </div>
            </div>
            {/* <span>{this.props.positionActualShutter}</span> */}
            {/*<Limits
              lowerLimit={0}
              upperLimit={100}
              currentValue={this.props.positionActualShutter}
              targetValue={this.props.positionCommandedShutter}
              height={25}
              displayLabels={true}
              limitWarning={0}
            />*/}
          </div>
        </SummaryPanel>
      </div>
    );
  }
}
