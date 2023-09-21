import express from "express";
// import { handleData } from "../controllers/data.js";
import RXEventModel from "../model/RXEventModel.js";

const pushData = async (req, res) => {
  await RXEventModelNew.create(req.body);
	res.sendStatus(201);
}

const getData = async (req, res) => {
	const events = await RXEventModelNew.find();
	res.json(events);
}


const router = express.Router();
router.get("", getData);
router.post("", pushData);

export default router;