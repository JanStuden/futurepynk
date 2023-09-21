import mongoose, { Schema } from 'mongoose';


//[
//  {
//    "description": "GPS Timestamp in UTC",
//    "mode": "NULLABLE",
//    "name": "timestamp",
//    "type": "TIMESTAMP"
//  },
//  {
//    "description": "GPS position",
//    "mode": "NULLABLE",
//    "name": "latitude",
//    "type": "FLOAT64"
//  },
//  {
//    "description": "GPS position",
//    "mode": "NULLABLE",
//    "name": "longitude",
//    "type": "FLOAT64"
//  },
//  {
//    "description": "NO concentration in parts per billion",
//    "mode": "NULLABLE",
//    "name": "no_ppb",
//    "type": "FLOAT64"
//  },
//  {
//    "description": "NO2 concentration in parts per billion",
//    "mode": "NULLABLE",
//    "name": "no2_ppb",
//    "type": "FLOAT64"
//  },
//  {
//    "description": "O3 concentration in parts per billion",
//    "mode": "NULLABLE",
//    "name": "o3_ppb",
//    "type": "FLOAT64"
//  },
//  {
//    "description": "CO concentration in parts per million",
//    "mode": "NULLABLE",
//    "name": "co_ppm",
//    "type": "FLOAT64"
//  },
//  {
//    "description": "CO2 concentration in parts per million",
//    "mode": "NULLABLE",
//    "name": "co2_ppm",
//    "type": "FLOAT64"
//  },
//  {
//    "description": "PM channel 1 measurement in counts per litre",
//    "mode": "NULLABLE",
//    "name": "pmch1_perl",
//    "type": "INTEGER"
//  },
//  {
//    "description": "PM channel 2 measurement in counts per litre",
//    "mode": "NULLABLE",
//    "name": "pmch2_perl",
//    "type": "INTEGER"
//  },
//  {
//    "description": "PM channel 3 measurement in counts per litre",
//    "mode": "NULLABLE",
//    "name": "pmch3_perl",
//    "type": "INTEGER"
//  },
//  {
//    "description": "PM channel 4 measurement in counts per litre",
//    "mode": "NULLABLE",
//    "name": "pmch4_perl",
//    "type": "INTEGER"
//  },
//  {
//    "description": "PM channel 5 measurement in counts per litre",
//    "mode": "NULLABLE",
//    "name": "pmch5_perl",
//    "type": "INTEGER"
//  },
//  {
//    "description": "PM channel 6 measurement in counts per litre",
//    "mode": "NULLABLE",
//    "name": "pmch6_perl",
//    "type": "INTEGER"
//  },
//  {
//    "description": "PM2.5 concentration in µg/m3",
//    "mode": "NULLABLE",
//    "name": "pm25_ugm3",
//    "type": "FLOAT64"
//  }
//]
const rxEventSchema = mongoose.Schema({
	timestamp: Date,
	latitude: Number,
	longitude: Number,
	no_ppb: Number,
	no2_ppb: Number,
	o3_ppb: Number,
	co_ppm: Number,
	co2_ppm: Number,
	pmch1_perl: Number,
	pmch2_perl: Number,
	pmch3_perl: Number,
	pmch4_perl: Number,
	pmch5_perl: Number,
	pmch6_perl: Number,
	pm25_ugm3: Number,
}, { timestamps: true });

export default mongoose.model('RXEvent', rxEventSchema);
