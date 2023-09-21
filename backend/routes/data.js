import express from "express";
// import { handleData } from "../controllers/data.js";
import RXEventModel from "../model/RXEventModel.js";
import fetch from 'node-fetch'; // Import the 'node-fetch' library
import fs from 'fs';
import csv from 'csv-parser';
import axios from 'axios';


// Replace 'your.csv' with the path to your CSV file
const csvFilePath = 'static_data.csv';
const locationInfos = [];
fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (data) => {
  	locationInfos.push(data);
  })

const pushData = async (req, res) => {
	await RXEventModel.create(mapDatapointToStatic(req.body));
	res.sendStatus(201);
}

const getData = async (req, res) => {
	const events = await RXEventModel.find();
	res.json(events);
}

const getStreetName = async (lat, lng)  => {
	const apiKey = 'AIzaSyA3dDaBj1LBp_smJQqbICMH76Z5gUGLrtg';
	const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
	
	try {
		const response = await fetch(url);

		if(response.status !== 200) {
			return null;
		}

		const data = await response.json();
		const address = data.results[0].formatted_address;
		const streetName = address.split(' ')[0];
		
		return streetName;
	} catch (err) {
		console.log(err);
		return null;
	}
}


// merge datapoint with closes location info
async function mapDatapointToStatic(datapoint) {
	const lng = datapoint.longitude;
	const lat = datapoint.latitude;


	let closestLocationInfo = null;
	const streetName = await getStreetName(lat, lng);


  // Replace 'your.csv' with the path to your CSV file
  const csvFilePath = 'static_data.csv';
  const locationInfos = [];
  fs.createReadStream(csvFilePath)
	  .pipe(csv())
	  .on('data', (data) => {
	  	locationInfos.push(data);
	  })
	
	let locationInfosInSameStreet = [];
	locationInfos.forEach((locationInfo) => { if(locationInfo.osm_name===streetName.trim()) { locationInfosInSameStreet.push(locationInfo)} });
  
	// Find the closest datapoint
	let closestDistance = 1000000.0;
	locationInfos.forEach((entry) => {
		let lng2 = entry.geom.split('(')[1].split(' ')[0];
		let lat2 = entry.geom.split('(')[1].split(' ')[1].slice(0, -1);
		
		const currentDistance = calculateDistance(lat, lng, lat2, lng2);
		if (currentDistance < closestDistance) {
			closestDistance = currentDistance;
			closestLocationInfo = entry;
		}
	});

	return { ...closestLocationInfo, ...datapoint };
}

const calculateDistance = (lat1, lon1, lat2, lon2) => {
	// Convert latitude and longitude from degrees to radians
	const radLat1 = (Math.PI * lat1) / 180;
	const radLon1 = (Math.PI * lon1) / 180;
	const radLat2 = (Math.PI * lat2) / 180;
	const radLon2 = (Math.PI * lon2) / 180;

	// Radius of the Earth in kilometers
	const earthRadius = 6371; // Use 3959 for miles

	// Haversine formula
	const dLat = radLat2 - radLat1;
	const dLon = radLon2 - radLon1;

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	// Calculate the distance
	const distance = earthRadius * c;

	return distance;
}

// For a given origin and destination 
// find the route with the lowest polution overall
const findBestRoute = async (req,res) => {
	const destination = req.query.destination;
	const origin = req.query.origin;
	let polutionCounter =  {"O3": 0.0, "CO2": 0.0, "NO2": 0.0, "NO": 0.0, "CO": 0.0};
	let fastestRoute = {type:"fastest", duration: 100000.0, totalPolution: 100000.0, totalCO2: 0.0, totalNO2: 0.0, totalNO: 0.0, totalCO: 0.0, totalO3: 0.0, totalBestRoute: null};
	
	const query = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=AIzaSyA3dDaBj1LBp_smJQqbICMH76Z5gUGLrtg&alternatives=true`
	const response = await axios.get(query);
	let data = response.data;
	console.log(data.routes)
	for(let i = 0; i < data.routes.length; i++){
		let route = data.routes[i];
		let steps = route.legs[0].steps;

		steps.forEach(step => {
			let polution =  calculatePolution(step);
			for(const key in polution){
				polutionCounter[key] += polution[key];
			}
		})

		let totalPolution = 0.0;

		Object.values(polutionCounter).forEach(value => {
			totalPolution += value;
		});

		if(fastestRoute.duration > route.legs[0].duration.value){
			fastestRoute.duration = route.legs[0].duration.value;
			fastestRoute.totalBestRoute = route;
			fastestRoute.totalPolution = totalPolution;
			fastestRoute.totalCO2 = polutionCounter.CO2;
			fastestRoute.totalNO2 = polutionCounter.NO2;
			fastestRoute.totalNO = polutionCounter.NO;
			fastestRoute.totalCO = polutionCounter.CO;
			fastestRoute.totalO3 = polutionCounter.O3;
		}

	}
	console.log(fastestRoute)
	res.status(200).json(fastestRoute);
}

// find the data point (measurement) to a given coordinate
// and return it as the pollution at the coordinate
const calculatePolution = async (req,res) => {
	const jsonData = await fetch("https://patch-happy-vegetable.glitch.me/polutionData.json")
	let data = await jsonData.json();
	console.log(data)
	let nearest_point = null;
	let nearest_measurement = 100000;
	let totalPolution = 0.0;
	locationInfos.forEach((locationInfo) => { 
		//get nearest point
		let lng2 = locationInfo.geom.split('(')[1].split(' ')[0];
		let lat2 = locationInfo.geom.split('(')[1].split(' ')[1].slice(0, -1);
		let lat1 = req.params.lat;
		let lng1 = req.params.lng;
		let distance = calculateDistance(lat1, lng1, lat2, lng2);
		if(distance < nearest_measurement) {
			nearest_measurement = distance;
			nearest_point = entry;
		}
	});

			//query polution from latest datapoint
			nearest_point = {"O3": 0.2, "CO2": 0.2, "NO2": 0.2, "NO": 0.2, "CO": 0.2};
			for (const key in nearest_point) {
				nearest_point[key] *= 30;
			}
			Object.values(nearest_point).forEach(value => {
				totalPolution += value;
			});
			data.totalPolution += totalPolution;
			data.CO2 += nearest_point.CO2;
			data.NO2 += nearest_point.NO2;
			data.NO += nearest_point.NO;
			data.CO += nearest_point.CO;
			data.O3 += nearest_point.O3;
			console.log(data)

			const dataToSend = ['Sample Data 1', 'Sample Data 2'];

			fetch('https://script.google.com/macros/s/AKfycbzDYByYB7n4i_x-3dt59qBSsHLLYMDfRnTnq8GODzNenSLsD7qF00O284DkCtW5h0pCFA/exec', {
			  method: 'POST',
			  headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			  },
			  body: 'data=' + JSON.stringify(dataToSend)
			})
			  .then(response => response.json())
			  .then(data => {
				console.log(data);
				// Handle the response data as needed
			  })
			  .catch(error => {
				console.error("Error sending data:", error);
			  });
			  fetch('https://script.google.com/macros/s/AKfycbzDYByYB7n4i_x-3dt59qBSsHLLYMDfRnTnq8GODzNenSLsD7qF00O284DkCtW5h0pCFA/exec')
			  .then(response => response.json())
			  .then(data => {
				console.log(data);
				// Handle the retrieved data as needed
			  })
			  .catch(error => {
				console.error("Error fetching data:", error);
			  });
			res.status(200).json(data);
	}



const router = express.Router();

router.get("", getData);
router.post("", pushData);
router.get("/calcPol", calculatePolution);


export default router;

