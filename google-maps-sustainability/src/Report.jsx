import React, { Component } from 'react';
import './report.css'; // Import the CSS file

class Report extends Component {
  constructor(props) {
    super(props);
    this.state = {
      totalPolution: 0,
      totalCO2: 0,
      totalNO2: 0,
      totalSO2: 0,
      totalPM25: 0,
      totalPM10: 0,
      totalO3: 0,
      totalNH3: 0,
      tripPolution: 0,
      tripCO2: 0,
      tripNO2: 0,
      tripSO2: 0,
      tripPM25: 0,
      tripPM10: 0,
      tripO3: 0,
      tripNH3: 0,
    };
  }
  

  render() {
    return (
      <div className="report-container">
        <div className="grid-container">
          <div className='grid-item'>
            <div className='grid-item-description'>totalPolution</div>
            {this.state.totalPolution}
          </div>
          <div className='grid-item'>
            <div className='grid-item-description'>tripPolution</div>
            {this.state.tripPolution}
          </div>
          <div className='grid-item'>
            <div className='grid-item-description'>tripCO2</div>
            {this.state.tripCO2}
          </div>
          <div className='grid-item'>
            <div className='grid-item-description'>totalCO2</div>
            {this.state.totalCO2}
          </div>
          <div className='grid-item'>
            <div className='grid-item-description'>totalNO2</div>
            {this.state.totalNO2}
          </div>
          <div className='grid-item'>
            <div className='grid-item-description'>totalSO2</div>
            {this.state.totalSO2}
          </div>
          <div className='grid-item'>
            <div className='grid-item-description'>totalPM25</div>
            {this.state.totalPM25}
          </div>
          <div className='grid-item'>
            <div className='grid-item-description'>totalPM10</div>
            {this.state.totalPM10}
          </div>
          <div className='grid-item'>
            <div className='grid-item-description'>totalO3</div>
            {this.state.totalO3}
          </div>
          <div className='grid-item'>
            <div className='grid-item-description'>totalNH3</div>
            <div>{this.state.totalNH3}</div>
          </div>
        </div>
      </div>
    );
    
  }
}

export default Report;

