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

// Load environment variables
dotenv.config();

const mongoDBConnectionSting = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_INITDB_DATABASE}?authSource=admin`;

const initializeDatabase = async () => {
  // await RXEventModel.create({
  //   timestamp: "2022-11-01T06:25:08Z",
  //   latitude: 53.5451182100375,
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
  }

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
      const {_id, ...newEvent } = event;
      await RXEventModelNew.create(newEvent);
    }

    console.log("Data copied successfully.");
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

console.log(mongoDBConnectionSting);
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
