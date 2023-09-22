import express from "express";
// import { handleData } from "../controllers/data.js";
import RXEventModel from "../model/RXEventModel.js";
import fetch from 'node-fetch'; // Import the 'node-fetch' library
import fs from 'fs';
import csv from 'csv-parser';
import axios from 'axios';

// Replace 'your.csv' with the path to your CSV file
const locationInfosCsvPath = 'static/locationInfos.csv';
const locationInfos = [];
fs.createReadStream(locationInfosCsvPath)
  .pipe(csv())
  .on('data', (data) => {
  	locationInfos.push(data);
  })

const pushData = async (req, res) => {
	await RXEventModel.create(req.body);
	res.sendStatus(201);
}

const getData = async (req, res) => {
	const events = await RXEventModel.find();
	res.json(events);
}



const getLocationInfos = new Promise((resolve) => {
	const locationInfoCsv = `static/locationInfos.csv`;
	const locationInfos = [];
	fs.createReadStream(locationInfoCsv)
	  .pipe(csv())
	  .on('data', async (locationInfo) => {
		locationInfos.push(locationInfo);
	  })
	  .on('close', () => {
		resolve(locationInfos);
	  });
  });

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

		let currentStep = 0;
		while(currentStep < steps) {
			let polution = await calculatePolution(step);
			for(const key in polution){
				polutionCounter[key] += polution[key];
			}
			currentStep++;
		}

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
const calculatePolution = async (step) => {
	let nearest_point = null;
	let nearest_measurement = 100000;
	const locationInfos = await getLocationInfos();
	locationInfos.forEach((locationInfo) => { 
		//get nearest point
		let lng2 = locationInfo.geom.split('(')[1].split(' ')[0];
			let lat2 = locationInfo.geom.split('(')[1].split(' ')[1].slice(0, -1);
				let lat1 = step.start_location.lat;
				let lng1 = step.start_location.lng;
				let distance = calculateDistance(lat1, lng1, lat2, lng2);
				if(distance < nearest_measurement) {
					nearest_measurement = distance;
					nearest_point = locationInfo;
				}
	});

			//query polution from latest datapoint
			nearest_point = {"O3": 0.2, "CO2": 0.2, "NO2": 0.2, "NO": 0.2, "CO": 0.2};
			for (const key in nearest_point) {
				nearest_point[key] *= step.duration.value;
			}
		return nearest_point;
	}



const router = express.Router();

router.get("", getData);
router.post("", pushData);
router.get("/findBestRoute", findBestRoute);


export default router;

