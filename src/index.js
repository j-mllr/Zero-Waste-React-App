import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import mapboxgl from 'mapbox-gl';
import { BrowserRouter } from 'react-router-dom';
import store from './store/configureStore';
import { Provider } from 'react-redux';

mapboxgl.accessToken =
  'pk.eyJ1Ijoiam1pbGxhciIsImEiOiJjano5NnpiY2kwOXAzM2NsbzJrNmdzNnFtIn0.0wsjbxKPo2ngn-Q5D7H_DA';

let map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v9',
  center: [-123.1126, 49.2418],
  zoom: 11
});

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <App map={map} />
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
