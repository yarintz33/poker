import express from "express";
//import User from "../mongoConnection.js"; // Ensure the correct file extension is used
//import jwt from "jsonwebtoken";
import { authFunc } from "../middleware/authenticationHandler.js";
import login from "./controllers/loginHandler.js";
import logout from "./controllers/logoutHandler.js";
import { API_BASE_PATH } from "../config/apiConfig.js";
const loginRoutes = express.Router();
const api = API_BASE_PATH;

loginRoutes.post(api + "login", login);

loginRoutes.get(api + "logout", authFunc, logout);

export default loginRoutes;
