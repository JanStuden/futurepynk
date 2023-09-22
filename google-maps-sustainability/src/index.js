import React, { Component } from 'react';
import { render } from 'react-dom';
import Map from './Map';
import Report from './Report'; // Import the Report component

render(
  <div>
    <Report />
    <Map center={{ lat: 53.5823396, lng: 10.0791587 }} zoom={11} />
  </div>, document.getElementById('root')
);
