import './App.css';
import React from 'react';
import { GoogleMap, LoadScript, Marker, HeatMap } from '@react-google-maps/api';
import axios from 'axios';
import { useEffect, useState } from 'react';


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
        setData(response.data);
        setLoading(false);
        console.log(data)
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);
  return (
    <div className="App">
      <LoadScript
        googleMapsApiKey="AIzaSyAGZoSeRrwH7zI9rR5OUxTGh--4ePQPItA
" // Replace with your Google Maps API key
      >
        <Map center={center} />
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
