import React from 'react';
import './App.css';
import { Switch, Route } from 'react-router-dom';
import Create from './Create';
import Home from './Home';
import { connect } from 'react-redux';

class App extends React.Component {
  render() {
    return (
      <>
        <Main map={this.props.map}></Main>
      </>
    );
  }
}

export default connect(function mapStateToProps(state, props) {
  return {
    assetList: state.assetList,
    isGeocoderVisible: state.geocoder
  };
})(App);

const Main = props => (
  <Switch>
    <Route
      exact
      path="/"
      render={routeProps => <Home map={props.map} />}
    ></Route>
    <Route
      exact
      path="/create"
      render={routeProps => <Create map={props.map} />}
    ></Route>
  </Switch>
);
