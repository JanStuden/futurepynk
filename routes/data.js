import express from "express";
// import { handleData } from "../controllers/data.js";


const data = [];
const pushData = (req, res) => {
	data.push(req.body);
	res.sendStatus(201);
}

const getData = (req, res) => {
	res.json(data);
}

const router = express.Router();
router.get("", getData);
router.post("", pushData);

export default router;
