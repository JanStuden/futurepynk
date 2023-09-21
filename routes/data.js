import express from "express";
import { handleData, findbestRoute } from "../controllers/data.js";

const router = express.Router();
router.get("/", handleData);
router.get("/findBestRoute", findbestRoute);



export default router;