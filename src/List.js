import React from 'react';

export default class List extends React.Component {
  render() {
    return (
      <>
        <SearchBar
          stateHandler={this.props.stateHandler}
          plotAssets={this.props.plotAssets}
        />
        <div id="assetList">
          <div className="assets">
            {!this.props.assetList.features.length > 0 &&
              this.props.lastPage !== 'CREATE' && <div>No assets found</div>}
            {this.props.assetList.features.map(asset => (
              <ListItem
                chosenAsset={
                  asset === this.props.chosenAsset
                    ? { color: 'red' }
                    : { color: 'black' }
                }
                updateChosenAsset={this.props.updateChosenAsset}
                asset={asset}
                key={asset.properties.id}
                name={asset.properties.asset_name}
                updateIdToRefMap={this.props.updateIdToRefMap}
              />
            ))}
          </div>
        </div>
      </>
    );
  }
}

class ListItem extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  componentDidMount() {
    this.props.updateIdToRefMap(this.props.asset, this.myRef);
  }

  render() {
    return (
      <a
        ref={this.myRef}
        style={this.props.chosenAsset}
        onClick={e => {
          this.props.updateChosenAsset(this.props.asset, this.myRef);
        }}
        id={this.props.id}
      >
        {this.props.name}
      </a>
    );
  }
}

class SearchBar extends React.Component {
  state = { searchTerm: '' };
  getData(stateHandler) {
    fetch('/geojson/' + this.state.searchTerm)
      .then(response => {
        return response.json();
      })
      .then(myJson => {
        stateHandler(myJson);
      });
  }

  handleSubmit = event => {
    event.preventDefault();
    this.getData(this.props.stateHandler);
  };

  render() {
    return (
      <div id="stickyHeader">
        <h1 id="assets">
          Assets
          <form id="searchForm" onSubmit={this.handleSubmit}>
            <input
              id="searchInput"
              placeholder="Search..."
              type="text"
              name="name"
              onChange={event =>
                this.setState({ searchTerm: event.target.value })
              }
            />
          </form>
        </h1>
      </div>
    );
  }
}
