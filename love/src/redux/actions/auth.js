import { REMOVE_TOKEN, REQUEST_TOKEN, RECEIVE_TOKEN, REJECT_TOKEN, EXPIRE_TOKEN } from './actionTypes';
import ManagerInterface from '../../Utils';
import { getToken } from '../selectors';

export const requestToken = (username, password) => ({
  type: REQUEST_TOKEN,
  username,
  password,
});

export const receiveToken = (token) => ({
  type: RECEIVE_TOKEN,
  token,
});

export const rejectToken = {
  type: REJECT_TOKEN,
};

 /**
  * redux-thunk action generator that requests a token from the LOVE-manager in case it does not exist in the localstorage and handles its response.
  * 
  * @param {string} username 
  * @param {string} password 
  */
export function fetchToken(username, password) {
  const url = `${ManagerInterface.getApiBaseUrl()}get-token/`;
  return (dispatch, getState) => {
    const storageToken = localStorage.getItem('LOVE-TOKEN');
    if (storageToken && storageToken.length > 0) {
      dispatch(receiveToken(storageToken));
      return;
    }

    dispatch(requestToken(username, password));
    return fetch(url, {
      method: 'POST',
      headers: ManagerInterface.getHeaders(),
      body: JSON.stringify({
        username,
        password,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        const { token } = response;
        if (token !== undefined && token !== null) {
          dispatch(receiveToken(token));
          localStorage.setItem('LOVE-TOKEN', token);
          return;
        }

        dispatch(rejectToken);
      })
      .catch((e) => console.log(e));
  };
}

export const removeToken = {
  type: REMOVE_TOKEN,
};

export const expireToken = {
  type: EXPIRE_TOKEN,
};

/**
 * Validates the token with the server.
 * Nothing changes if everything is ok. Other cases are handled individually.
 */
export function validateToken() {
  return async (dispatch, getState) => {
    const token = getToken(getState());
    if (token === null || token === undefined) {
      return Promise.resolve();
    }

    const url = `${ManagerInterface.getApiBaseUrl()}validate-token/`;
    return fetch(url, {
      method: 'GET',
      headers: new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      }),
    }).then((response) => {
      if (response.status >= 500) {
        // console.error('Error communicating with the server. Logging out\n', response);
        dispatch(removeToken);
        return Promise.resolve();
      }

      if (response.status === 401 || response.status === 403) {
        console.log('Session expired. Logging out');
        dispatch(expireToken);
        return Promise.resolve();
      }

      return response.json().then((resp) => {
        const { detail } = resp;
        if (detail !== 'Token is valid') {
          dispatch(removeToken);
        }
      });
    });
  };
}