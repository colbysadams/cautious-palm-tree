/**
 *
 * WebSocketPage
 *
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';

import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import makeSelectWebSocketPage from './selectors';
import reducer from './reducer';
import saga from './saga';
import List from '../../components/List';
import ListItem from '../../components/ListItem';
import { defaultAction, restartAction, updateRateLimitAction } from './actions';
import StyledButton from '../../components/Button/StyledButton';
import Input from '../HomePage/Input';

const WebSocketPageListItem = props => {
  const {
    time,
    data: { ip_address: ipAddress, path },
  } = props.item;
  return (
    <ListItem
      item={
        <>
          <span>
            <b>{new Date(time).toISOString()}</b> IP:[<code>{ipAddress}</code>]{' '}
            PATH: <code>{path}</code>
          </span>
        </>
      }
    />
  );
};

WebSocketPageListItem.propTypes = {
  item: PropTypes.object.isRequired,
};

const webSocketHost = () => {
  const loc = window.location;
  const protocol = loc.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${loc.host}`;
};

export function WebSocketPage(props) {
  useInjectReducer({ key: 'webSocketPage', reducer });
  useInjectSaga({ key: 'webSocketPage', saga });
  const [wsClient, setWsClient] = useState();
  // const [serverInputs, setServerInputs] = useState({
  //   maxEventsPerSecond: 10000,
  //   batchSize: 1000,
  // });

  const openWsConnection = () => {
    props.dispatch(restartAction());
    const c = new WebSocket(`${webSocketHost()}/api/websocket`);
    c.addEventListener('message', msg => {
      // console.log('addEventListenter.message', msg);
      const jsonMsg = JSON.parse(msg.data);
      // console.log('received message', jsonMsg);
      props.dispatch(defaultAction(jsonMsg));
    });
    c.addEventListener('open', () => {
      // console.log('use effect.send');
      c.send(JSON.stringify({ ...props.webSocketPage.server, type: 'hello' }));
    });
    c.addEventListener('close', () => {
      console.log('closed websocket connection');
    });
    return c;
  };

  // console.log('props', props);
  useEffect(() => {
    console.log('use effect');
    setWsClient(openWsConnection(props.dispatch));
    // eslint-disable-next-line new-cap
  }, []);

  return (
    <div>
      <StyledButton
        onClick={() => {
          if (wsClient != null) {
            wsClient.close();
            setWsClient(null);
          } else {
            setWsClient(openWsConnection());
          }
        }}
      >
        {wsClient != null ? 'pause' : 'resume'}
      </StyledButton>
      {wsClient == null && (
        <>
          <h3>Server options</h3>
          <div>
            <Input
              name="maxEventsPerSecond"
              value={props.webSocketPage.server.maxEventsPerSecond.toString()}
              onChange={e => {
                let rateLimit = 5000;
                try {
                  rateLimit = parseInt(e.target.value, 10);
                  // eslint-disable-next-line no-empty
                } catch (err) {}
                props.dispatch(
                  updateRateLimitAction({
                    ...props.webSocketPage,
                    server: {
                      ...props.webSocketPage.server,
                      maxEventsPerSecond: rateLimit,
                    },
                  }),
                );
              }}
            />{' '}
            - maxEventsPerSecond
          </div>
          <div>
            <Input
              name="batchSize"
              value={props.webSocketPage.server.batchSize.toString()}
              onChange={e => {
                let newValue = 1000;
                try {
                  newValue = parseInt(e.target.value, 10);
                  // eslint-disable-next-line no-empty
                } catch (err) {
                  console.error(err);
                }
                props.dispatch(
                  updateRateLimitAction({
                    ...props.webSocketPage,
                    server: {
                      ...props.webSocketPage.server,
                      batchSize: newValue,
                    },
                  }),
                );
              }}
            />{' '}
            - batchSize
          </div>
          <h3>Client Options</h3>
          <div>
            <Input
              name="rateLimit"
              value={props.webSocketPage.rateLimitItemsPerSecond.toString()}
              onChange={e => {
                let rateLimit = 5;
                try {
                  rateLimit = parseInt(e.target.value, 10);
                  // eslint-disable-next-line no-empty
                } catch (err) {}
                props.dispatch(
                  updateRateLimitAction({
                    ...props.webSocketPage,
                    rateLimitItemsPerSecond: rateLimit,
                  }),
                );
              }}
            />{' '}
            - rateLimit
          </div>
          <div>
            <Input
              name="inMemoryMaxSize"
              value={props.webSocketPage.maxSize.toString()}
              onChange={e => {
                let val = 200;
                try {
                  val = parseInt(e.target.value, 10);
                  // eslint-disable-next-line no-empty
                } catch (err) {}
                props.dispatch(
                  updateRateLimitAction({
                    ...props.webSocketPage,
                    maxSize: val,
                  }),
                );
              }}
            />{' '}
            - inMemoryMaxSize
          </div>
        </>
      )}
      <hr />
      <h4>Received</h4>
      <h5>
        <code>total : {props.webSocketPage.itemsReceived}</code>
      </h5>
      <h5>
        <code>
          rate/s:{' '}
          {Math.round(
            (props.webSocketPage.itemsReceived /
              ((+Date.now() - props.webSocketPage.startTime) / 1000)) *
              100,
          ) / 100}
        </code>
      </h5>
      <h4>Displayed</h4>
      <h5>total: {props.webSocketPage.itemsWritten}</h5>
      <h5>
        rate/s:{' '}
        {Math.round(
          (props.webSocketPage.itemsWritten /
            ((+Date.now() - props.webSocketPage.startTime) / 1000)) *
            100,
        ) / 100}
      </h5>
      <List
        component={WebSocketPageListItem}
        items={props.webSocketPage.items}
      />
    </div>
  );
}

WebSocketPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  webSocketPage: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  webSocketPage: makeSelectWebSocketPage(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(WebSocketPage);
