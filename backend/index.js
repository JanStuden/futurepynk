import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";

import dataRouter from "./routes/data.js";
import dataRouterN from "./routes/Ndata.js";
import RXEventModel from "./model/RXEventModel.js";
import RXEventModelNew from "./model/RXEventModelNew.js";
import ApplicationSettingsModel from "./model/ApplicationSettingsModel.js";
import dotenv from "dotenv";
import fs from 'fs';
import csv from 'csv-parser';
import fetch from "node-fetch";

// Load environment variables
dotenv.config();

const mongoDBConnectionSting = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_INITDB_DATABASE}?authSource=admin`;


let currentWriteProcessRunning = false;
const dataPointQueue = [];
let addedElements = 0;
const writeDataPointIntoMongo = async (dataPoint) => {
  dataPointQueue.push(dataPoint);
  if (currentWriteProcessRunning) {
    return;
  }
  currentWriteProcessRunning = true;

  while (dataPointQueue.length > 0) {
    const elem = dataPointQueue.shift();
    await RXEventModel.create(elem);
    addedElements = addedElements + 1;
  }

  console.log(addedElements);
  // Import Data
  currentWriteProcessRunning = false;
}


const getStreetName = async (lat, lng) => {
  const apiKey = 'AIzaSyA3dDaBj1LBp_smJQqbICMH76Z5gUGLrtg';
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

  try {
    const response = await fetch(url);

    if (response.status !== 200) {
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

// blubss
let locationInfos = [];
const getLocationInfos = () => new Promise((resolve) => {
  if(locationInfos.length > 0) {
    resolve(locationInfos);
    return;
  }
  const locationInfoCsv = `static/locationInfos.csv`;
  fs.createReadStream(locationInfoCsv)
    .pipe(csv())
    .on('data', async (locationInfo) => {
      locationInfos.push(locationInfo);
    })
    .on('close', () => {
      resolve(locationInfos);
    });
});

// merge datapoint with closes location info
const getClosestLocationInfo = async (datapoint) => {
  const lng = datapoint.longitude;
  const lat = datapoint.latitude;


  const locationInfos = await getLocationInfos();

  let closestLocationInfo = null;
  // const streetName = await getStreetName(lat, lng);

  // let locationInfosInSameStreet = locationInfos.filter(currentLocationInfo => {
  //   currentLocationInfo.osm_name === streetName.trim()
  // }
  // );

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

  return closestLocationInfo;
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


const importAirtable = async (csvPath) => {
  const rxEvents = await RXEventModel.find();
  console.log(rxEvents.length);
  if (rxEvents.length >= 500) {
    console.log("We have enough rx events, dont import more");
    return;
  }

  // Replace 'your.csv' with the path to your CSV file
  const dataPointsCsvPath = 'static/dataPoints1.csv';

  let addedElements = 0;
  fs.createReadStream(dataPointsCsvPath)
    .pipe(csv())
    .on('data', (dataPoint) => {
      if(addedElements < 500) {
        writeDataPointIntoMongo(dataPoint);
        addedElements = addedElements + 1;
      }
    })
}

const annotateDataPointsWithClosestLocationInfos = async () => {
  const rxEvents = await RXEventModel.find({ closestLocationInfo: { $exists: false } });
  let i = 0;
  while (i < rxEvents.length) {
    const currentRxEvent = rxEvents[i];
    const closestLocationInfo = await getClosestLocationInfo(rxEvents[i]);
    console.log(closestLocationInfo);
    await RXEventModel.findByIdAndUpdate(currentRxEvent._id, { ...currentRxEvent, closestLocationInfo });
    i = i + 1;
  }
}

const initializeDatabase = async () => {

  // await RXEventModel.create({
  //   timestamp: "2022-11-01T06:25:08Z",
  //   latitude: 53.54511822000375,
  //   longitude: 9.99366075292565,
  //   no_ppb: 2.321,
  //   no2_ppb: 9.328,
  //   o3_ppb: null,
  //   co_ppm: 0.416,
  //   co2_ppm: 521.725,
  //   pmch1_perl: 147540,
  //   pmch2_perl: 21600,
  //   pmch3_perl: 2340,
  //   pmch4_perl: 900,
  //   pmch5_perl: 540,
  //   pmch6_perl: 240,
  //   pm25_ugm3: 28.218,
  // });
};



const initMongoose = async (mongoDbConnectionString) => {
  console.log(mongoDbConnectionString);
  mongoose.connect(mongoDbConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    //useFindAndModify: false,
    //poolSize: 50,
    ignoreUndefined: true,
  });

  // Create initial tables and entrys if initial tables not created yet
  const applicationSettingsModel = await ApplicationSettingsModel.findById(
    "applicationSettings"
  );
  if (!applicationSettingsModel) {
    console.log("Database not initialized. Initializing now.");
    await initializeDatabase();
    await ApplicationSettingsModel.create({ _id: "applicationSettings" });
  }
  importAirtable();
  annotateDataPointsWithClosestLocationInfos();

  try {
    // 1. Retrieve all documents from the existing collection
    const events = await RXEventModel.find();

    for (let i = 1; i < events.length; i++) {
      const currentEvent = events[i];
      const previousEvent = events[i - 1];

      // Check if the latitude and longitude are the same as the previous event
      if (
        currentEvent.latitude === previousEvent.latitude &&
        currentEvent.longitude === previousEvent.longitude
      ) {
        // If the same, remove the current event from the array
        events.splice(i, 1);
        i--; // Decrement the index to recheck the new current event
      }
    }

    for (const event of events) {
      const { _id, ...newEvent } = event;
      await RXEventModelNew.create(newEvent);
    }

    console.log("Data copied successful1y.");
  } catch (error) {
    console.error("Error copying data:", error);
  }
};

const app = express();

// define the port to run on
const port = process.env.PORT || 5000;

// use bodyParser & define default parameter
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.use("/data", dataRouter);
app.use("/datan", dataRouterN);

initMongoose(mongoDBConnectionSting);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
/*
// connect to mongodb using a connection string
const CONNECTION_URL = "mongodb+srv://max:max123@di.6jqtvsa.mongodb.net/seodashboard?retryWrites=true&w=majority";
mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        app.listen(port, () => {
            console.log("Server is running");
        })
    })
    .catch((error) => console.log(error.message));

mongoose.set("returnOriginal", false);
mongoose.set("strictQuery", true);
*/
