/* @flow */

// external
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {ApolloProvider} from 'react-apollo';
import AWSAppSyncClient from 'aws-appsync';
import {Rehydrated} from 'aws-appsync-react';

// internal
import {appSyncConfig} from './config';
import App from './App';

// initialize
const client = new AWSAppSyncClient(appSyncConfig);

ReactDOM.render(
  <ApolloProvider client={client}>
    <Rehydrated>
      <App />
    </Rehydrated>
  </ApolloProvider>,
  window.document.getElementsByClassName('___main')[0],
);
