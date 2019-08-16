import React from 'react';
import './App.css';
import { NavLink } from 'react-router-dom';
import MapboxGeocoder from 'mapbox-gl-geocoder';
import { connect } from 'react-redux';

let TYPES = ['Donation', 'Second Hand', 'Repair', 'Reduced Packaging', 'Share'];
let accessToken =
  'pk.eyJ1Ijoiam1pbGxhciIsImEiOiJjano5NnpiY2kwOXAzM2NsbzJrNmdzNnFtIn0.0wsjbxKPo2ngn-Q5D7H_DA';

class Create extends React.Component {
  constructor(props) {
    super(props);
    this.getAddress = this.getAddress.bind(this);
    this.pinDropped = this.pinDropped.bind(this);
    this.validateForm = this.validateForm.bind(this);
  }

  state = {
    assetList: null,
    dropPin: false,
    assetName: '',
    assetType: '',
    assetAddress: '',
    assetLong: '',
    assetLat: '',
    error: false,
    errorMessage: ''
  };

  getAddress(result) {
    let nameLength = result.text.length;
    return result.place_name.slice(nameLength + 2);
  }

  pinDropped(e) {
    let tempGeoJson = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [e.lngLat['lng'], e.lngLat['lat']]
      }
    };

    if (this.state.dropPin === true) {
      this.props.map.getSource('single-point').setData(tempGeoJson);
      this.setState({ assetLong: e.lngLat['lng'] });
      this.setState({ assetLat: e.lngLat['lat'] });
    }
  }

  validateForm(e) {
    if (this.state.assetName === '') {
      e.preventDefault();
      this.setState({
        error: true,
        errorMessage: 'Please fill in the asset name'
      });
    } else if (this.state.assetType === '') {
      e.preventDefault();
      this.setState({ error: true, errorMessage: 'Asset type is required' });
    } else if (this.state.assetLong === '' || this.state.assetLat === '') {
      e.preventDefault();
      this.setState({
        error: true,
        errorMessage: 'Please use the search or drop a pin'
      });
    }
  }

  componentDidMount() {
    let map = this.props.map;
    var geocoder = new MapboxGeocoder({
      accessToken: accessToken
    });

    if (this.props.lastPage === 'HOME') {
      if (!this.props.map.loaded()) {
        setTimeout(() => {
          console.log('Map not loaded - delay');
          this.removeHomeMapStyles(map);
        }, 1500);
      } else {
        this.removeHomeMapStyles(map);
      }
    } else {
      map.on('load', () => {
        console.log('on create load');
        map.addSource('single-point', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        });
        map.addLayer({
          id: 'point',
          type: 'symbol',
          source: 'single-point',
          layout: {
            'icon-image': 'marker-15',
            'icon-size': 1.5
          }
        });
        map.addSource('locations', {
          type: 'geojson',
          data: this.state.assetList
        });
      });
    }

    map.addControl(geocoder);
    geocoder.on('result', ev => {
      map.getSource('single-point').setData(ev.result.geometry);
      this.setState({
        assetName: ev.result.text,
        assetAddress: this.getAddress(ev.result),
        assetLong: ev.result.geometry.coordinates[0],
        assetLat: ev.result.geometry.coordinates[1],
        dropPin: false
      });
    });

    map.on('click', this.pinDropped);
    this.props.dispatch({
      type: 'ON_CREATE',
      data: geocoder,
      function: this.pinDropped
    });
  }

  removeHomeMapStyles(map) {
    for (let type of TYPES) {
      map.off('click', 'poi-' + type, this.props.removeableFunction);
      if (map.getLayer('poi-' + type)) {
        map.removeLayer('poi-' + type);
      }
    }

    if (this.props.assetList.features.length > 0) {
      map.removeSource('locations');
      map.addSource('locations', {
        type: 'geojson',
        data: this.state.assetList
      });
    }

    map.addSource('single-point', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

    map.addLayer({
      id: 'point',
      type: 'symbol',
      source: 'single-point',
      layout: {
        'icon-image': 'marker-15',
        'icon-size': 1.5
      }
    });
  }

  render() {
    let errorMessage = '';
    if (this.state.error) {
      errorMessage = this.state.errorMessage;
    }

    return (
      <>
        <div id="mainHeader">
          Zero Waste Asset Map
          <div id="navigation">
            <nav>
              <div id="home">
                {' '}
                <NavLink to="/">Home</NavLink>{' '}
              </div>
              <div id="create">
                {' '}
                <NavLink to="/create">Create </NavLink>
              </div>
            </nav>
          </div>
        </div>
        <div id="appContainer">
          <div id="content">
            <div>
              <h1 id="createHeader">Add an asset</h1>
            </div>
            <div id="errorMessage"> {errorMessage} </div>
            <form method="post">
              <div id="assetBoxes">
                <label id="nameLabel" htmlFor="asset_name">
                  Asset Name
                </label>
                <input
                  name="asset_name"
                  id="asset_name"
                  value={this.state.assetName}
                  onChange={e => this.setState({ assetName: e.target.value })}
                  required
                />
                <label id="typeLabel" htmlFor="asset_type">
                  Asset Type
                </label>
                <select
                  name="asset_type"
                  defaultValue="Default"
                  onChange={e => {
                    this.setState({ assetType: e.target.value });
                  }}
                  required
                >
                  <option disabled value="Default">
                    -- Select a type --
                  </option>
                  <option value="Donation">Donation</option>
                  <option value="Repair">Repair</option>
                  <option value="Reduced Packaging">Reduced Packaging</option>
                  <option value="Second Hand">Second-Hand</option>
                  <option value="Share">Share</option>
                </select>
                <label id="addressLabel" htmlFor="asset_address">
                  Address
                </label>
                <textarea
                  name="asset_address"
                  id="asset_address"
                  value={this.state.assetAddress}
                  onChange={e =>
                    this.setState({ assetAddress: e.target.value })
                  }
                ></textarea>
                <input
                  type="hidden"
                  name="latitude"
                  id="latitude"
                  value={this.state.assetLat}
                  onChange={e => this.setState({ assetLat: e.target.value })}
                />
                <input
                  type="hidden"
                  name="longitude"
                  id="longitude"
                  value={this.state.assetLong}
                  onChange={e => this.setState({ assetLong: e.target.value })}
                />
                <input
                  id="submitButton"
                  type="submit"
                  value="Submit"
                  onClick={e => this.validateForm(e)}
                />
                <button
                  type="button"
                  id="dropPin"
                  onClick={e =>
                    this.setState({
                      dropPin: true,
                      assetLat: '',
                      assetLong: '',
                      assetAddress: ''
                    })
                  }
                >
                  {' '}
                  Drop pin{' '}
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
    );
  }
}

export default connect(function mapStateToProps(state, props) {
  return {
    assetList: state.assetList,
    isGeocoderVisible: state.geocoder,
    lastPage: state.lastPage,
    removeableFunction: state.removeableFunction
  };
})(Create);
