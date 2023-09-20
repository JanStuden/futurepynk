import express from "express";
import { handleData } from "../controllers/data.js";

const router = express.Router();
router.get("/", handleData);



export default router;