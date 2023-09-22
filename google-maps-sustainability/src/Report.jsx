import React, { Component } from 'react';
import './report.css'; // Import the CSS file

class Report extends Component {
  constructor(props) {
    super(props);
    this.state = {
      totalPolution: 0,
      totalCO2: 0,
      totalNO2: 0,
      totalCO: 0,
      totalPM25: 0,
      totalPM: 0,
      totalO3: 0,
      totalNO: 0,
      tripPolution: 0,
      tripCO2: 0,
      tripNO2: 0,
      tripSO2: 0,
      tripPM25: 0,
      tripPM10: 0,
      tripDuration: 0,
      tripID: 0,
    };
  }
  componentDidMount() {
    // Fetch data initially when the component mounts
    console.log("componentDidMount")
    this.fetchData();

    // Set up a timer to fetch data every minute
    this.timer = setInterval(() => {
      this.fetchData();
    }, 10000); // 60000 milliseconds = 1 minute
  }

  componentWillUnmount() {
    // Clear the timer when the component unmounts to prevent memory leaks
    clearInterval(this.timer);
  }

  fetchData() {
    fetch('https://script.google.com/macros/s/AKfycbzDYByYB7n4i_x-3dt59qBSsHLLYMDfRnTnq8GODzNenSLsD7qF00O284DkCtW5h0pCFA/exec')
      .then((response) => response.json())
      .then((data) => {
        // Update the component's state with the fetched data
        console.log(data.data[data.data.length - 1][0]);
        this.setState({
          totalPolution: data.data[data.data.length - 1][0].toFixed(2),
          totalCO2: data.data[data.data.length - 1][1].toFixed(2),
          totalNO2: data.data[data.data.length - 1][2].toFixed(2),
          totalCO:  data.data[data.data.length - 1][4].toFixed(2),
          totalPM25: data.totalPM25,
          totalPM: data.data[data.data.length - 1][6].toFixed(2),
          totalO3: data.data[data.data.length - 1][5].toFixed(2),
          totalNO: data.data[data.data.length - 1][3].toFixed(2),
          tripPolution: data.data[data.data.length - 1][8].toFixed(2),
          tripID: data.data[data.data.length - 1][7],
          tripSO2: data.tripSO2,
          tripPM25: data.tripPM25,
          tripPM10: data.tripPM10,
          tripO3: data.tripO3,
          tripNH3: data.tripNH3,
        });
        if(data.data[data.data.length - 1][7]===0){
          this.setState({
          tripDuration: 0
          });
        }
        else{
          this.setState({
            tripDuration: Date.now() - data.data[data.data.length - 1][7]
            });
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }

  render() {
    return (
      <div className="report-container">
        <div className="grid-container">
          <div className='grid-item'>
            <div className='grid-item-description'>Trip ID</div>
            {this.state.tripID}
          </div>
          <div className='grid-item'>
            <div className='grid-item-description'>Trip Time</div>
            {(this.state.tripDuration/60000).toFixed(1)}min
          </div>
          <div className='grid-item'>
            <div className='grid-item-description'>Trip Polution</div>
            {this.state.tripPolution}ml
          </div>
          <div className='grid-item'>
            <div className='grid-item-description'>Total Polution</div>
            {this.state.totalPolution}ml
          </div>
          <div className='grid-item'>
            <div className='grid-item-description'>Total CO2</div>
            {this.state.totalCO2}ml
          </div>
          <div className='grid-item'>
            <div className='grid-item-description'>Total NO2</div>
            {this.state.totalNO2}ml
          </div>
          <div className='grid-item'>
            <div className='grid-item-description'>Total CO</div>
            {this.state.totalCO}ml
          </div>
          <div className='grid-item'>
            <div className='grid-item-description'>Total PM</div>
            {this.state.totalPM}µ
          </div>
          <div className='grid-item'>
            <div className='grid-item-description'>Total O3</div>
            {this.state.totalO3}ml
          </div>
          <div className='grid-item'>
            <div className='grid-item-description'>Total NO</div>
            {this.state.totalNO}ml
          </div>
          
        </div>
      </div>
    );
    
  }
}

export default Report;