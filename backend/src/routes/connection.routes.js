// routes/connection.routes.js
import express from "express";
import {
  sendConnectionRequest,
  acceptConnectionRequest,
  getAcceptedConnections,
  getPendingRequests
} from "../controllers/connection.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/send", protectRoute, sendConnectionRequest);
router.post("/accept", protectRoute, acceptConnectionRequest);
router.get("/accepted", protectRoute, getAcceptedConnections);
router.get("/pending", protectRoute, getPendingRequests);
export default router;