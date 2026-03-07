import express from "express";
import { handleCallback } from "./controller.js";

const router = express.Router();

router.get("/callback", handleCallback);

export default router;
