import { createStore, applyMiddleware } from 'redux';
import WS from 'jest-websocket-mock';
import rootReducer from '../reducers';
import thunkMiddleware from 'redux-thunk';
import {
  openWebsocketConnection,
  requestGroupSubscription,
} from '../actions/ws';
import { removeCSCLogMessages, removeCSCErrorCodeData } from '../actions/summaryData';
import {
  getCSCLogMessages,
  getCSCErrorCodeData,
  getAllStreamsAsDictionary,
  getGroupSortedErrorCodeData,
} from '../selectors';
import * as mockData from './mock';
import { flatMap } from '../../Utils';

let store, server;

beforeEach(async () => {
  store = createStore(rootReducer, applyMiddleware(thunkMiddleware));
  // prevent fetch call for token
  localStorage.setItem('LOVE-TOKEN', 'love-token');
  server = new WS('ws://localhost/manager/ws/subscription?token=love-token', { jsonProtocol: true });
  await store.dispatch(openWebsocketConnection());
});

afterEach(() => {
  server.close();
});

it('It should extract the summary and log messages properly from the state with the generic reshape selector', async () => {
  const summaryATDome = {
    ATDomeID: { value: 1, dataType: 'Int' },
    private_revCode: { value: 'c38fc5a2', dataType: 'String' },
    private_sndStamp: { value: 1563885828.2869709, dataType: 'Float' },
    private_rcvStamp: { value: 1563885828.3042052, dataType: 'Float' },
    private_seqNum: { value: 4, dataType: 'Int' },
    private_origin: { value: 32, dataType: 'Int' },
    private_host: { value: 843720695, dataType: 'Int' },
    summaryState: { value: 1, dataType: 'Int' },
    priority: { value: 0, dataType: 'Int' },
  };

  const summaryScriptqueue = {
    ScriptQueueID: { value: 1, dataType: 'Int' },
    private_revCode: { value: '16ec6358', dataType: 'String' },
    private_sndStamp: { value: 1563885938.2406523, dataType: 'Float' },
    private_rcvStamp: { value: 1563885938.2410805, dataType: 'Float' },
    private_seqNum: { value: 4, dataType: 'Int' },
    private_origin: { value: 44, dataType: 'Int' },
    private_host: { value: 619616180, dataType: 'Int' },
    summaryState: { value: 1, dataType: 'Int' },
    priority: { value: 0, dataType: 'Int' },
  };

  await server.connected;
  await store.dispatch(requestGroupSubscription('event-ATDome-1-summaryState'));
  await store.dispatch(requestGroupSubscription('event-ATDome-1-logMessage'));
  await store.dispatch(requestGroupSubscription('event-ScriptQueue-1-summaryState'));

  server.send({
    category: 'event',
    data: [
      {
        csc: 'ATDome',
        salindex: 1,
        data: {
          summaryState: [summaryATDome],
        },
      },
    ],
  });

  server.send({
    category: 'event',
    data: [
      {
        csc: 'ScriptQueue',
        salindex: 1,
        data: {
          summaryState: [summaryScriptqueue],
        },
      },
    ],
  });

  server.send({
    category: 'event',
    data: [
      {
        csc: 'ATDome',
        salindex: 1,
        data: {
          logMessage: mockData.ATDomeLogMessages,
        },
      },
    ],
  });

  const cscsList = [
    ['ATDome', 1],
    ['ScriptQueue', 1],
  ];

  const summariesDictionary = getAllStreamsAsDictionary(store.getState(), 'event', cscsList, 'summaryState', true);

  const expectedSummaries = {
    'ScriptQueue-1': summaryScriptqueue,
    'ATDome-1': summaryATDome,
  };

  expect(summariesDictionary).toEqual(expectedSummaries);

  /**
   * When some cscs dont have data the keys return undefined values
   */
  const logMessagesDictionary = getAllStreamsAsDictionary(store.getState(), 'event', cscsList, 'logMessage');

  const expectedLogMessages = {
    'ATDome-1': mockData.ATDomeLogMessages,
  };

  expect(logMessagesDictionary).toEqual(expectedLogMessages);
});

it('It should extract all received logMessages from the state for a given CSC', async () => {
  await server.connected;
  await store.dispatch(requestGroupSubscription('event-ATDome-1-logMessage'));

  let messages = [];

  expect(getCSCLogMessages(store.getState(), 'ATDome', 1)).toEqual(messages);
  mockData.ATDomeLogMessages.forEach((message) => {
    server.send({
      category: 'event',
      data: [
        {
          csc: 'ATDome',
          salindex: 1,
          data: {
            logMessage: [message],
          },
        },
      ],
    });

    messages = [...messages, message];
    const storedMessages = getCSCLogMessages(store.getState(), 'ATDome', 1);
    expect(storedMessages).toEqual(messages);
  });
});

it('Should delete all logMessages of a CSC with an action ', async () => {
  // Arrange
  await server.connected;
  await store.dispatch(requestGroupSubscription('event-ATDome-1-logMessage'));

  let messages = [];

  expect(getCSCLogMessages(store.getState(), 'ATDome', 1)).toEqual(messages);
  mockData.ATDomeLogMessages.forEach((message) => {
    server.send({
      category: 'event',
      data: [
        {
          csc: 'ATDome',
          salindex: 1,
          data: {
            logMessage: [message],
          },
        },
      ],
    });

    messages = [...messages, message];
  });
  expect(getCSCLogMessages(store.getState(), 'ATDome', 1)).toEqual(messages);

  // Act

  store.dispatch(removeCSCLogMessages('ATDome', 1));

  // Assert
  expect(getCSCLogMessages(store.getState(), 'ATDome', 1)).toEqual([]);
});

it('It should extract all errorCode event data  from the state for a given CSC', async () => {
  await server.connected;
  await store.dispatch(requestGroupSubscription('event-Test-1-errorCode'));

  let messages = [];

  expect(getCSCErrorCodeData(store.getState(), 'Test', 1)).toEqual(messages);
  mockData.TestCSCErrorCodeData.forEach((message) => {
    server.send({
      category: 'event',
      data: [
        {
          csc: 'Test',
          salindex: 1,
          data: {
            errorCode: [message],
          },
        },
      ],
    });

    messages = [...messages, message];
    const storedMessages = getCSCErrorCodeData(store.getState(), 'Test', 1);
    expect(storedMessages).toEqual(messages);
  });
});

it('It should delete errorCode event data  from the state for a given CSC', async () => {
  // Arrange
  await server.connected;
  await store.dispatch(requestGroupSubscription('event-Test-1-errorCode'));

  let messages = [];

  expect(getCSCErrorCodeData(store.getState(), 'Test', 1)).toEqual(messages);
  mockData.TestCSCErrorCodeData.forEach((message) => {
    server.send({
      category: 'event',
      data: [
        {
          csc: 'Test',
          salindex: 1,
          data: {
            errorCode: [message],
          },
        },
      ],
    });

    messages = [...messages, message];
  });
  const storedMessages = getCSCErrorCodeData(store.getState(), 'Test', 1);
  expect(storedMessages).toEqual(messages);

  // Act
  store.dispatch(removeCSCErrorCodeData('Test', 1));

  // Assert
  expect(getCSCErrorCodeData(store.getState(), 'Test', 1)).toEqual([]);
});

it('Should extract a sorted list of a subset of errorCode event data ', async () => {
  // Arrange
  await server.connected;
  await store.dispatch(requestGroupSubscription('event-Test-1-errorCode'));
  await store.dispatch(requestGroupSubscription('event-Test-2-errorCode'));

  expect(getCSCErrorCodeData(store.getState(), 'Test', 1)).toEqual([]);
  server.send({
    category: 'event',
    data: [
      {
        csc: 'Test',
        salindex: 1,
        data: {
          errorCode: mockData.TestCSCErrorCodeData,
        },
      },
    ],
  });

  server.send({
    category: 'event',
    data: [
      {
        csc: 'Test',
        salindex: 2,
        data: {
          errorCode: mockData.TestCSCErrorCodeData,
        },
      },
    ],
  });

  const flat1 = flatMap(mockData.TestCSCErrorCodeData, (msg) => {
    return {
      csc: 'Test',
      salindex: 1,
      ...msg,
    };
  });
  const flat2 = flatMap(mockData.TestCSCErrorCodeData, (msg) => {
    return {
      csc: 'Test',
      salindex: 2,
      ...msg,
    };
  });

  let sortedMessages = [...flat1, ...flat2].sort((msg1, msg2) => {
    return msg1.private_rcvStamp.value > msg2.private_rcvStamp.value ? -1 : 1;
  });

  // Act
  const storedMessages = getGroupSortedErrorCodeData(store.getState(), [
    { name: 'Test', salindex: 1 },
    { name: 'Test', salindex: 2 },
  ]);

  // Assert
  storedMessages.forEach((msg, index) => {
    expect(msg.csc).toEqual(sortedMessages[index].csc);
    expect(msg.salindex).toEqual(sortedMessages[index].salindex);
  });
});