import React, { Component } from "react";
import { Map, HeatMap, GoogleApiWrapper } from "google-maps-react";

const gradient = [
  "rgba(0, 255, 255, 0)",
  "rgba(0, 255, 255, 1)",
  "rgba(0, 191, 255, 1)",
  "rgba(0, 127, 255, 1)",
  "rgba(0, 63, 255, 1)",
  "rgba(0, 0, 255, 1)",
  "rgba(0, 0, 223, 1)",
  "rgba(0, 0, 191, 1)",
  "rgba(0, 0, 159, 1)",
  "rgba(0, 0, 127, 1)",
  "rgba(63, 0, 91, 1)",
  "rgba(127, 0, 63, 1)",
  "rgba(191, 0, 31, 1)",
  "rgba(255, 0, 0, 1)"
];

class MapContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      processedData: [], // Initialize as an empty array
      isLoading: true, // Add a loading flag
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    try {
      console.log("Started fetching...");
      const response = await fetch("https://lite-air.app/backend/data");

      if (!response.ok) {
        throw new Error(`Failed to fetch data (${response.status})`);
      }

      const data = await response.json();
      console.log(data);

      const processedDataArray = this.processData(data);

      this.setState({ processedData: processedDataArray, isLoading: false }); // Set isLoading to false
      console.log("Finished Transformation");
      console.log(processedDataArray);
    } catch (error) {
      console.error("Error fetching data:", error);
      this.setState({ isLoading: false }); // Set isLoading to false in case of an error
    }
  }

  processData(data) {
    return data.map(item => {
      const weight = Object.keys(item)
        .filter(key => key !== 'latitude' && key !== 'longitude')
        .reduce((acc, key) => {
          const value = parseFloat(item[key]);
          if (!isNaN(value)) {
            return acc + value;
          }
          return acc;
        }, 0);

      return {
        lat: item.latitude,
        lng: item.longitude,
        weight: weight
      };
    });
  }

  componentWillUpdate(nextProps, nextState) {
    if (!this.state.isLoading && nextState.isLoading) {
      // Data has been loaded, trigger re-render
      this.forceUpdate();
    }
  }

  render() {
    const { processedData, isLoading } = this.state;
    console.log("STATE", this.state);
    console.log("!!!", processedData);

    if (isLoading) {
      // Display a loading message or spinner while data is being fetched
      return <div>Loading...</div>;
    }

    return (
      <div className="map-container">
        <Map
          google={this.props.google}
          className={"map"}
          zoom={this.props.zoom}
          initialCenter={this.props.center}
        >
          <HeatMap
            gradient={gradient}
            positions={processedData}
            opacity={0.5}
            radius={14}
          />
        </Map>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: "AIzaSyAGZoSeRrwH7zI9rR5OUxTGh--4ePQPItA",
  libraries: ["visualization"]
})(MapContainer);
