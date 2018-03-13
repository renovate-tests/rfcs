/* @flow */

// external
import * as React from 'react';
import {Query} from 'react-apollo';
import {gql} from 'apollo-boost';

// internal
// import moduleName from './schema';

type Props = {};
type State = {};

export default class App extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    (async () => {
      // await this.context.client.hydrated();
      console.log(this.context);
    })();
  }

  handleOnClick(event: Event) {
    event.preventDefault();
    console.log('clicked');
  }

  render() {
    console.log(this.props);

    const GET_DOG = gql`
      query {
        listEvents {
          items {
            id
            name
          }
        }
      }
    `;

    return (
      <div>
        <Query query={GET_DOG} variables={{}}>
          {({loading, error, data}) => {
            console.log(data);
            console.log(error);

            if (loading) return <div>Loading...</div>;
            if (error) return <div>Error :(</div>;

            return <span>Success!!</span>;
          }}
        </Query>
        <button onClick={event => this.handleOnClick(event)}>Awesome!!</button>
      </div>
    );
  }
}
