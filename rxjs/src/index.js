/* @flow */

// external
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {setObservableConfig, componentFromStream} from 'recompose';
import rxjsConfig from 'recompose/rxjsObservableConfig';
import {Observable} from 'rxjs';

// initialize
setObservableConfig(rxjsConfig);

const CounterApp = componentFromStream(props$ =>
  Observable.interval(1000).map(count => <h1>{count}</h1>),
);

const StreamingMessageApp = componentFromStream(props$ =>
  props$.map(({message}) => <h1>{message}</h1>),
);

const WithStreamingMessageApp = componentFromStream(props$ =>
  props$
    .switchMap(({message, speed}) => createTypewriter(message, speed))
    .map(message => ({message}))
    .map(App),
);

const App = ({message}) => (
  <div>
    <h1>{message}</h1>
  </div>
);

const createTypewriter = (message, speed) =>
  Observable.zip(
    Observable.from(message),
    Observable.interval(speed),
    letter => letter,
  ).scan((accumulatedValue, currentValue) => accumulatedValue + currentValue);

ReactDOM.render(
  <div>
    <CounterApp />
    <StreamingMessageApp message="Hello world!" />
    <WithStreamingMessageApp message="Hello world!!" speed={1000} />
  </div>,
  window.document.getElementsByClassName('___main')[0],
);
