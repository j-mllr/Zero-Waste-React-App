import { createStore } from 'redux';

let defaultList = { type: 'FeatureCollection', features: [] };

fetch('/geojson')
  .then(response => {
    return response.json();
  })
  .then(myJson => {
    defaultList = myJson;
  })
  .catch(e => {
    console.log(e);
  });

var defaultState = {
  assetList: defaultList,
  geocoder: null,
  lastPage: 'NONE',
  removeableFunction: null
};

function amount(state = defaultState, action) {
  switch (action.type) {
    case 'ON_CREATE':
      return {
        ...state,
        assetList: { type: 'FeatureCollection', features: [] },
        geocoder: action.data,
        lastPage: 'CREATE',
        removeableFunction: action.function
      };
    case 'UPDATE_ASSETS':
      return {
        ...state,
        assetList: action.data,
        geocoder: null,
        lastPage: 'HOME',
        removeableFunction: action.function
      };
    default:
      return state;
  }
}

var store = createStore(amount);

export default store;
