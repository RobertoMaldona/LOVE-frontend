import { RECEIVE_TIME_DATA, CLOCK_START, CLOCK_STOP, CLOCK_TICK } from '../actions/actionTypes';

export const clockStatuses = {
  STARTED: 'STARTED',
  STOPPED: 'STOPPED',
};

export const initialState = {
  request_time: 0,
  receive_time: 0,
  server_time: {
    utc: 0,
    tai: 0,
    mjd: 0,
    sidereal_summit: 0,
    sidereal_greenwich: 0,
    tai_to_utc: 0,
  },
  clock_status: clockStatuses.STOPPED,
  clock: {
    utc: 0,
    tai: 0,
    mjd: 0,
    server_time: 0,
    sidereal_summit: 0,
    sidereal_greenwich: 0,
  },
};
/**
 * Modifies the state of the authentication mainly characterized by the
 * token received from the LOVE-manager and its status.
 */
export default function (state = initialState, action) {
  switch (action.type) {
    case RECEIVE_TIME_DATA: {
      return {
        ...state,
        request_time: action.request_time,
        receive_time: action.receive_time,
        server_time: {
          utc: action.time_data.utc,
          tai: action.time_data.tai,
          mjd: action.time_data.mjd,
          observing_day: action.time_data.observing_day,
          sidereal_summit: action.time_data.sidereal_summit,
          sidereal_greenwich: action.time_data.sidereal_greenwich,
          tai_to_utc: action.time_data.tai_to_utc,
        },
      };
    }
    case CLOCK_START: {
      return { ...state, clock_status: clockStatuses.STARTED };
    }
    case CLOCK_STOP: {
      return { ...state, clock_status: clockStatuses.STOPPED };
    }
    case CLOCK_TICK: {
      return {
        ...state,
        clock: { ...action.clock },
      };
    }
    default:
      return state;
  }
}
