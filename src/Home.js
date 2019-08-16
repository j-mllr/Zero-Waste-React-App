import React from 'react';
import './App.css';
import mapboxgl from 'mapbox-gl';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import List from './List.js';

const SYMBOL = {
  Donation: '#0D7FFF',
  'Second Hand': '#FFBE2A',
  Repair: '#E700FF',
  'Reduced Packaging': '#009393',
  Share: '#FF3919'
};

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.updateAssetList = this.updateAssetList.bind(this);
    this.updateChosenAsset = this.updateChosenAsset.bind(this);
    this.setAsset = this.setAsset.bind(this);
    this.plotAssets = this.plotAssets.bind(this);
    this.updateMapAssets = this.updateMapAssets.bind(this);
    this.createPopUp = this.createPopUp.bind(this);
    this.updateIdToRefMap = this.updateIdToRefMap.bind(this);
  }
  state = {
    assetList: this.props.assetList,
    chosenId: null,
    chosenAsset: null,
    assetLayerTypes: new Set(),
    idToRefMap: new Map()
  };

  closePopUp() {
    var popUps = document.getElementsByClassName('mapboxgl-popup');
    if (popUps[0]) {
      popUps[0].remove();
    }
  }

  flyToAsset(chosenAsset) {
    this.closePopUp();
    let map = this.props.map;
    map.flyTo({
      center: chosenAsset.geometry.coordinates.slice(),
      zoom: 15
    });
  }

  createPopUp(e) {
    let map = this.props.map;
    var coordinates = e.features[0].geometry.coordinates.slice();
    var description = e.features[0].properties;

    let { id, asset_name, asset_type, address, postal_code } = description;

    let html = '';
    if (asset_type === 'ReducedPackaging') {
      html =
        '<data class=' +
        id +
        '></data>' +
        '<div class=popName>' +
        asset_name +
        '</div>' +
        '<div class=infoGrid> <div class=popAddressLabel> Address: </div>  <div class=popAddress>' +
        address +
        '</div>' +
        '<div class=typeLabel> Type: </div> <div class=type> Reduced Packaging </div> </div>';
    } else if (asset_type === 'SecondHand') {
      html =
        '<data class=' +
        id +
        '></data>' +
        '<div class=popName>' +
        asset_name +
        '</div>' +
        '<div class=infoGrid> <div class=popAddressLabel> Address: </div>  <div class=popAddress>' +
        address +
        '</div>' +
        '<div class=typeLabel> Type: </div> <div class=type>  Second Hand </div> </div>';
    } else {
      html =
        '<data class=' +
        id +
        '></data>' +
        '<div class=popName>' +
        asset_name +
        '</div>' +
        '<div class=infoGrid> <div class=popAddressLabel> Address: </div>  <div class=popAddress>' +
        address +
        '</div>' +
        '<div class=typeLabel> Type: </div> <div class=type>' +
        asset_type +
        '</div> </div>';
    }

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(html)
      .addTo(map);

    let selectedAsset = this.state.assetList.features.find(
      asset => id === asset.properties.id
    );
    let currentRef = this.state.idToRefMap.get(selectedAsset.properties.id);
    currentRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    this.setState({ chosenAsset: selectedAsset });
  }

  updateMapAssets() {
    let map = this.props.map;

    for (let type of this.state.assetLayerTypes) {
      map.off('click', 'poi-' + type, this.createPopUp);
      map.removeLayer('poi-' + type);
    }

    map.removeSource('locations');
    map.addSource('locations', {
      type: 'geojson',
      data: this.state.assetList
    });

    let types = new Set();
    this.state.assetList.features.map(asset => {
      let type = asset.properties.asset_type;
      let layerID = 'poi-' + type;
      types.add(type);
      if (!map.getLayer(layerID)) {
        map.addLayer({
          id: layerID,
          source: 'locations',
          type: 'circle',
          paint: {
            'circle-radius': 8,
            'circle-color': SYMBOL[type]
          },
          filter: ['==', 'asset_type', type]
        });
      }
    });

    this.setState({ assetLayerTypes: types });

    for (let type of types) {
      let layerID = 'poi-' + type;
      map.on('click', layerID, this.createPopUp);
    }
  }

  plotAssets() {
    let map = this.props.map;

    map.on('load', () => {
      map.addSource('locations', {
        type: 'geojson',
        data: this.state.assetList
      });

      let types = new Set();

      this.state.assetList.features.map(asset => {
        let type = asset.properties.asset_type;
        let layerID = 'poi-' + type;
        types.add(type);
        if (!map.getLayer(layerID)) {
          map.addLayer({
            id: layerID,
            source: 'locations',
            type: 'circle',
            paint: {
              'circle-radius': 8,
              'circle-color': SYMBOL[type]
            },
            filter: ['==', 'asset_type', type]
          });
        }
      });

      this.setState({ assetLayerTypes: types });

      for (let type of types) {
        let layerID = 'poi-' + type;
        map.on('click', layerID, this.createPopUp);
      }
    });
  }

  updateChosenAsset(asset) {
    this.setState({
      chosenId: asset
    });
  }

  updateIdToRefMap(asset, ref) {
    let copyOfMap = this.state.idToRefMap;
    copyOfMap.set(asset.properties.id, ref);
    this.setState({ idToRefMap: copyOfMap });
  }

  setAsset(asset, ref) {
    this.setState({
      chosenAsset: asset
    });
    this.flyToAsset(asset);
  }

  updateAssetList(newList) {
    this.props.dispatch({
      type: 'UPDATE_ASSETS',
      data: newList,
      function: this.createPopUp
    });
  }

  getData() {
    fetch('/geojson')
      .then(response => {
        return response.json();
      })
      .then(myJson => {
        this.props.dispatch({
          type: 'UPDATE_ASSETS',
          data: myJson,
          function: this.createPopUp
        });
      })
      .catch(e => {
        console.log(e);
      });
  }

  componentWillReceiveProps(newProps) {
    const oldProps = this.props;
    if (oldProps.assetList !== newProps.assetList) {
      if (oldProps.lastPage === 'NONE') {
        this.setState({ assetList: newProps.assetList }, this.plotAssets);
      } else {
        this.setState({ assetList: newProps.assetList }, this.updateMapAssets);
      }
    }
  }

  componentDidMount() {
    if (this.props.lastPage === 'CREATE') {
      if (!this.props.map.loaded()) {
        setTimeout(() => {
          console.log('Map not loaded - delay');
          this.removeCreateMapStyles();
        }, 1000);
      } else {
        this.removeCreateMapStyles();
      }
    } else if (this.props.lastPage === 'NONE') {
      this.getData();
    } else if (this.props.lastPage === 'HOME') {
      this.updateMapAssets();
    }
  }

  removeCreateMapStyles() {
    this.props.map.removeControl(this.props.isGeocoderVisible);
    this.props.map.off('click', this.props.removeableFunction);
    this.props.map.removeLayer('point');
    this.props.map.removeSource('single-point');
    this.getData();
  }

  render() {
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
            <List
              stateHandler={this.updateAssetList}
              updateChosenAsset={this.setAsset}
              chosenAsset={this.state.chosenAsset}
              assetList={this.props.assetList}
              plotAssets={this.plotAssets}
              updateIdToRefMap={this.updateIdToRefMap}
              lastPage={this.props.lastPage}
            />
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
})(Home);
