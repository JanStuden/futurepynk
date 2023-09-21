import React, { Component } from "react";
import { Map, HeatMap, GoogleApiWrapper } from "google-maps-react";

const gradient = [
  "rgba(255, 182, 193, 0)",  // Pink
  "rgba(255, 160, 180, 1)",
  "rgba(255, 138, 167, 1)",
  "rgba(255, 115, 155, 1)",
  "rgba(255, 93, 142, 1)",
  "rgba(255, 71, 130, 1)",
  "rgba(255, 48, 117, 1)",
  "rgba(255, 26, 105, 1)",
  "rgba(255, 0, 92, 1)",
  "rgba(235, 0, 82, 1)",
  "rgba(215, 0, 71, 1)",
  "rgba(194, 0, 61, 1)",
  "rgba(174, 0, 50, 1)",
  "rgba(154, 0, 39, 1)"    // Deep Red
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
            opacity={5}
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
