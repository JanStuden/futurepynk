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
	road_id	: Number,
  geom	: String,
  osm_id	: Number,
  osm_code	: String,
  osm_fclass	: String,
  osm_name	: String,
  osm_ref	: String,
  osm_oneway	: String,
  osm_maxspeed	: Number,
  osm_layer	: Number,
  osm_bridge	: Boolean,
  osm_tunnel	: Boolean,
  no2_points	:  Number,
  no2_drives	:  Number,
  no2_ppb	:  Number,
  no_points	:  Number,
  no_drives	:  Number,
  no_ppb	:  Number,
  co2_points	:  Number,
  co2_drives	:  Number,
  co2_ppm	:  Number,
  co_points	:  Number,
  co_drives	:  Number,
  co_ppm	:  Number,
  o3_points	:  Number,
  o3_drives	:  Number,
  o3_ppb	:  Number,
  pm25_points	:  Number,
  pm25_drives	:  Number,
  pm25_ugm3	:  Number,
  timestamp	:Date,
  latitude	: Number,
  longitude	: Number,
  pmch1_perl	: Number,
  pmch2_perl	: Number,
  pmch3_perl	: Number,
  pmch4_perl	: Number,
  pmch5_perl	: Number,
  pmch6_perl	: Number,
  closestLocationInfo: Object,
}, { timestamps: true });

export default mongoose.model('RXEvent', rxEventSchema);


