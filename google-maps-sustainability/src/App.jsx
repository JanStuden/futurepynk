import './App.css';
import React from 'react';
import { GoogleMap, LoadScript, Marker, HeatmapLayer } from '@react-google-maps/api';
import axios from 'axios';
import { useEffect, useState } from 'react';

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

const containerStyle = {
  width: '100vw',
  height: '100vh',
};

const center = {
  lat: 53.5511,
  lng: 9.9937,
};

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from the URL
    axios.get('https://lite-air.app/backend/data')
      .then(response => {
        const responseData = response.data;

        // Filter and modify the data
        const filteredData = responseData.filter(item => item.hasOwnProperty('timestamp'));
        const modifiedData = filteredData.map(item => {
          // Create a new object with the modified keys
          const { latitude, longitude, ...rest } = item;
          return { lat: latitude, lng: longitude, ...rest };
        });

        // Update the state with the modified data
        setData(modifiedData);
        setLoading(false);

        // Log the data here
        console.log(modifiedData);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  // Render loading indicator while data is being fetched
  if (loading) {
    return <div>Loading...</div>;
  }
  const libraries = ["visualization"];

  return (
    <div className="App">
      <LoadScript googleMapsApiKey="AIzaSyAGZoSeRrwH7zI9rR5OUxTGh--4ePQPItA" libraries={libraries}>
        <Map center={center} />
        <HeatmapLayer
          gradient={gradient}
          data={data}
          opacity={1}
          radius={20}
        ></HeatmapLayer>
      </LoadScript>
    </div>
  );
}

function Map({ center }) {
  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={10}
    >
      <Marker position={center} />
    </GoogleMap>
  );
}

export default App;
