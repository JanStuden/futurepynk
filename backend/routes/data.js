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
	console.log(events);
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

const fetchLongLat = async () => {
	let data = []
	let reset = false;
	fetch('https://script.google.com/macros/s/AKfycbxzxgSNnfDk4JCuewjv_fDKZAvqH0iELKenWuzUTXmHsVg9leH7ZIZZqV5eKWKsKI-l/exec')
		.then(response => response.json())
		.then(dataPoint => {
			//console.log(data);
			let lat = dataPoint.data[dataPoint.data.length-1][0]
			let lng = dataPoint.data[dataPoint.data.length-1][1]
			//console.log(lng, lat)
			
			if(lat!==0){
				reset = false;
				calculatePolution(lat, lng);
			}
			else{
				
				if(reset===false){
					console.log("null")
					reset = true;
	fetch('https://script.google.com/macros/s/AKfycbzDYByYB7n4i_x-3dt59qBSsHLLYMDfRnTnq8GODzNenSLsD7qF00O284DkCtW5h0pCFA/exec')
	.then(response => response.json())
	.then(dataPoint => {
		//console.log(dataPoint.data[dataPoint.data.length-1]);
		
		data[0] = dataPoint.data[dataPoint.data.length-1][0];
		data[1]= dataPoint.data[dataPoint.data.length-1][1];
		data[2] = dataPoint.data[dataPoint.data.length-1][2];
		data[3] = dataPoint.data[dataPoint.data.length-1][3];
		data[4] = dataPoint.data[dataPoint.data.length-1][4];
		data[5] = dataPoint.data[dataPoint.data.length-1][5];
		data[6] = dataPoint.data[dataPoint.data.length-1][6];
		data[7] = 0.0;
		data[8] = 0.0;
		fetch('https://script.google.com/macros/s/AKfycbzDYByYB7n4i_x-3dt59qBSsHLLYMDfRnTnq8GODzNenSLsD7qF00O284DkCtW5h0pCFA/exec', {
			method: 'POST',
			headers: {
			  'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: 'data=' + JSON.stringify(data)
		  })
			})
		}
			}
		
    // Handle the retrieved data as needed
  })
  .catch(error => {
    console.error("Error fetching data:", error);
  });
}
// find the data point (measurement) to a given coordinate
// and return it as the pollution at the coordinate
const calculatePolution = async (lat5, lng5) => {
	let data = {}
	let lat1 = lat5;
	let lng1 = lng5;
	const response = await fetch("https://lite-air.app/backend/data");
	const allDataPoints = await response.json();
	//console.log(allDataPoints)

	fetch('https://script.google.com/macros/s/AKfycbzDYByYB7n4i_x-3dt59qBSsHLLYMDfRnTnq8GODzNenSLsD7qF00O284DkCtW5h0pCFA/exec')
	.then(response => response.json())
	.then(dataPoint => {
		//console.log(dataPoint.data[dataPoint.data.length-1]);
		data.totalPolution = dataPoint.data[dataPoint.data.length-1][0];
		data.CO2 = dataPoint.data[dataPoint.data.length-1][1];
		data.NO2 = dataPoint.data[dataPoint.data.length-1][2];
		data.NO = dataPoint.data[dataPoint.data.length-1][3];
		data.CO = dataPoint.data[dataPoint.data.length-1][4];
		data.O3 = dataPoint.data[dataPoint.data.length-1][5];
		data.PM = dataPoint.data[dataPoint.data.length-1][6];
		if(dataPoint.data[dataPoint.data.length-1][7]!==0){
		data.id = dataPoint.data[dataPoint.data.length-1][7];
		}
		else{
			console.log("hier")
			data.id =Date.now();
		}
		data.tripPolution = dataPoint.data[dataPoint.data.length-1][8];
	  // Handle the retrieved data as needed
	
	
	let nearest_point = null;
	let nearest_measurement = 1.200;
	let totalPolution = 0.0;
	allDataPoints.forEach((locationInfo) => { 
		//get nearest point
		let lng2 = locationInfo.longitude;
		let lat2 = locationInfo.latitude;

		let distance = calculateDistance(lat1, lng1, lat2, lng2);
		if(distance < nearest_measurement) {
			nearest_measurement = distance;
			nearest_point = locationInfo;
		}
	});
			console.log("nearestpoint", nearest_point)
			//query polution from latest datapoint

			let all_pm = nearest_point.pmch1_perl+nearest_point.pmch2_perl+nearest_point.pmch3_perl+nearest_point.pmch4_perl+nearest_point.pmch5_perl+nearest_point.pmch6_perl;

			nearest_point = {"O3": nearest_point.o3_ppb, "CO2": nearest_point.co2_ppm, "NO2": nearest_point.no2_ppb, "NO": nearest_point.no_ppb, "CO": nearest_point.co_ppm, "PM": all_pm};
			for (const key in nearest_point) {
				//console.log(nearest_point[key])
				nearest_point[key] = (nearest_point[key]/1000000) * 3500;
			}
			Object.values(nearest_point).forEach(value => {
				totalPolution += value;
				
			});
			data.totalPolution += totalPolution;
			data.tripPolution += totalPolution;
			data.CO2 += nearest_point.CO2;
			data.NO2 += nearest_point.NO2;
			data.NO += nearest_point.NO;
			data.CO += nearest_point.CO;
			data.O3 += nearest_point.O3;
			data.PM += nearest_point.PM;
			//console.log(data)
			console.log("nearest Point ", nearest_point)
			const dataToSend = [data.totalPolution, data.CO2, data.NO2, data.NO, data.CO, data.O3, data.PM, data.id, data.tripPolution];
			//console.log(dataToSend)

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
			 
			//res.status(200).json(data);
		})
		.catch(error => {
		  console.error("Error fetching data:", error);
		});
	}

fetchLongLat();

// Schedule fetchLongLat to run every 30 seconds
const interval = 10 * 1000; // 30 seconds in milliseconds

setInterval(fetchLongLat, interval);

const router = express.Router();

router.get("", getData);
router.post("", pushData);
router.post("/calcPol", calculatePolution);


export default router;
