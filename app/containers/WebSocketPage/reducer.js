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
  rateLimitItemsPerSecond: 25,
  startTime: +Date.now(),
};

/* eslint-disable default-case, no-param-reassign */
const webSocketPageReducer = (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case DEFAULT_ACTION:
        // console.log('default action', action.items);
        action.items.forEach(item => {
          draft.itemsReceived += 1;
          if (
            draft.itemsWritten / ((+Date.now() - draft.startTime) / 1000) <
            draft.rateLimitItemsPerSecond
          ) {
            item.id = item.event_id;
            draft.items.unshift(item);
            if (draft.items.length > draft.maxSize) {
              draft.items.length = draft.maxSize;
            }
            draft.itemsWritten += 1;
          }
        });
        draft.lastBatchTime = +Date.now();
        break;
      case RESTART_ACTION:
        draft.itemsReceived = 0;
        draft.itemsWritten = 0;
        draft.startTime = +Date.now();
        break;
      case UPDATE_RATE_LIMIT_ACTION:
        draft.rateLimitItemsPerSecond = action.rateLimitItemsPerSecond;
        draft.maxSize = action.maxSize;
    }
  });

export default webSocketPageReducer;
