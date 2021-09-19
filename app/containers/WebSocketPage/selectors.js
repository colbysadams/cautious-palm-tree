import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the webSocketPage state domain
 */

const selectWebSocketPageDomain = state => state.webSocketPage || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by WebSocketPage
 */

const makeSelectWebSocketPage = () =>
  createSelector(
    selectWebSocketPageDomain,
    substate => substate,
  );

export default makeSelectWebSocketPage;
export { selectWebSocketPageDomain };
