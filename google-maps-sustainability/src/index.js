import React, { Component } from 'react';
import { render } from 'react-dom';
import Map from './Map';

render(<Map center={{ lat: 53.5632388, lng: 9.9176227 }} zoom={11} />, document.getElementById('root'));
