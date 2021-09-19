/*
 *
 * WebSocketPage actions
 *
 */

import {
  DEFAULT_ACTION,
  RESTART_ACTION,
  UPDATE_RATE_LIMIT_ACTION,
} from './constants';

export function defaultAction(items) {
  return {
    type: DEFAULT_ACTION,
    items,
  };
}

export function restartAction() {
  return {
    type: RESTART_ACTION,
  };
}

export function updateRateLimitAction(props) {
  console.log('updateRateLimitAction', props);
  return {
    type: UPDATE_RATE_LIMIT_ACTION,
    ...props,
  };
}
