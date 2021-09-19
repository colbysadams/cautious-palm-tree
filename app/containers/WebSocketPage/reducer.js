/*
 *
 * WebSocketPage reducer
 *
 */
import produce from 'immer';
import {
  DEFAULT_ACTION,
  RESTART_ACTION,
  UPDATE_RATE_LIMIT_ACTION,
} from './constants';

export const initialState = {
  items: [],
  maxSize: 100,
  itemsReceived: 0,
  itemsWritten: 0,
  rateLimitItemsPerSecond: 5,
  startTime: +Date.now(),
  server: {
    maxEventsPerSecond: 10000,
    batchSize: 1000,
  },
};

/* eslint-disable default-case, no-param-reassign */
const processDefaultAction = (draft, action) => {
  const newItems = [];
  action.items.forEach(item => {
    draft.itemsReceived += 1;
    if (
      draft.itemsWritten / ((+Date.now() - draft.startTime) / 1000) <
      draft.rateLimitItemsPerSecond
    ) {
      item.id = item.event_id;
      newItems.push(item);
      draft.itemsWritten += 1;
    }
  });
  draft.items = newItems.reverse().concat(draft.items);
  if (draft.items.length > draft.maxSize) {
    draft.items.length = draft.maxSize;
  }
  draft.lastBatchTime = +Date.now();
  return draft;
};

/* eslint-disable default-case, no-param-reassign */
const webSocketPageReducer = (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case DEFAULT_ACTION:
        draft = processDefaultAction(draft, action);
        break;
      case RESTART_ACTION:
        draft.itemsReceived = 0;
        draft.itemsWritten = 0;
        draft.startTime = +Date.now();
        break;
      case UPDATE_RATE_LIMIT_ACTION:
        draft.rateLimitItemsPerSecond = action.rateLimitItemsPerSecond;
        draft.maxSize = action.maxSize;
        draft.server = action.server;
    }
  });

export default webSocketPageReducer;
