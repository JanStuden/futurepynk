import express from "express";
// import { handleData } from "../controllers/data.js";
import RXEventModel from "../model/RXEventModel.js";
import fetch from 'node-fetch'; // Import the 'node-fetch' library
import fs from 'fs';
import csv from 'csv-parser';
import axios from 'axios';

// Replace 'your.csv' with the path to your CSV file
const csvFilePath = 'static_data.csv';

const results = [];
fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (data) => {
    results.push(data);
  })
  
const pushData = async (req, res) => {
	await RXEventModel.create(mapDatapointToStatic(req.body));
	res.sendStatus(201);
}

const getData = async (req, res) => {
	const events = await RXEventModel.find();
	res.json(events);
}

const mapDatapointToStatic = async (datapoint) => {
    const apiKey = 'AIzaSyA3dDaBj1LBp_smJQqbICMH76Z5gUGLrtg';
    const lng = datapoint.longitude;
    const lat = datapoint.latitude;
    let nearestStreet = 1000000.0;
    let final_dataPoint = null;

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    try {
        // Make the HTTP GET request
        const response = await fetch(url);

        // Check if the request was successful (status code 200)
        if (response.status === 200) {
            // Parse the JSON response
            const data = await response.json();
            const address = data.results[0].formatted_address;
            const streetName = address.split(' ')[0];
			console.log(streetName);
			console.log(results[15].osm_name, streetName)
			let filterCSV = []
			results.forEach((entry) => { if(entry.osm_name===streetName.trim()) { filterCSV.push(entry)} });
			
			filterCSV.forEach((entry) => {
				let lng2 = entry.geom.split('(')[1].split(' ')[0];
				let lat2 = entry.geom.split('(')[1].split(' ')[1].slice(0, -1);
				//console.log(lat2, lng2);
				if(calculateDistance(lat, lng, lat2, lng2)<nearestStreet) {
				
					nearestStreet = calculateDistance(lat, lng, lat2, lng2);
					final_dataPoint = entry;
				}
			});
			final_dataPoint = {...final_dataPoint, ...datapoint};
			console.log(final_dataPoint);
            return { final_dataPoint};
        } else {
            console.error('Request failed with status:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
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

  export const findbestRoute = async (req,res) => {
    try {
        console.log("Request body: ");
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
    catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const calculatePolution = (step) => {

	console.log(step);
	let nearest_point = null;
	let nearest_measurement = 100000;
	results.forEach((entry) => { 
		//get nearest point
		let lng2 = entry.geom.split('(')[1].split(' ')[0];
		let lat2 = entry.geom.split('(')[1].split(' ')[1].slice(0, -1);
		let lat1 = step.start_location.lat;
		let lng1 = step.start_location.lng;
		let distance = calculateDistance(lat1, lng1, lat2, lng2);
		if(distance < nearest_measurement) {
			nearest_measurement = distance;
			nearest_point = entry;
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
router.get("/findbestRoute", findbestRoute);


export default router;

