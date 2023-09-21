import React from 'react';
import { render } from 'react-dom';
import Map from './Map';     // Import the Map component
import Report from './Report'; // Import the Report component

const data = [
  { lat: 37.751266, lng: -122.40335500000003 }
];

// Render both the Report and Map components within a div with the id 'root'
render(
  <div>
    <Report />
    <Map center={{ lat: 37.775, lng: -122.434 }} zoom={14} positions={data} />
  </div>,
  document.getElementById('root') // Render everything inside the 'root' element in your HTML
);
