/*
 * FeaturePage
 *
 * List all the features
 */
import React from 'react';
import { Helmet } from 'react-helmet';
import { FormattedMessage } from 'react-intl';

import H1 from 'components/H1';
import messages from './messages';
import List from './List';
import ListItem from './ListItem';
import ListItemTitle from './ListItemTitle';

export default function FeaturePage() {
  return (
    <div>
      <Helmet>
        <title>Feature Page</title>
        <meta
          name="description"
          content="Feature page of React.js Boilerplate application"
        />
      </Helmet>
      <H1>Websocket test app</H1>
      <List>
        <ListItem>
          <ListItemTitle>source</ListItemTitle>
          <p>
            <a href="https://github.com/colbysadams/cautious-palm-tree/tree/master/app/containers/WebSocketPage">
              colbysadams/cautious-palm-tree
            </a>
          </p>
        </ListItem>
      </List>
    </div>
  );
}
