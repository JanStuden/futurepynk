import express from "express";
import cors from "cors";
import bodyParser from "body-parser";


import dataRouter from "./routes/data.js";


const app = express();

// define the port to run on
const port = process.env.PORT || 5000;

// use bodyParser & define default parameter
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));


app.use(cors());

app.use("/data", dataRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})
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
