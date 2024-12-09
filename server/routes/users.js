import express from "express";
//import cookieparser from 'cookie-parser';
import postTransactions from "./controllers/postTransactionsHandler.js";
import getTransactions from "./controllers/getTransactionsHandler.js";
import { User } from "../models/mongoSchemas.js";
import { authFunc } from "../middleware/authenticationHandler.js";
import register from "./controllers/registerHadler.js";
import registerValidation from "../middleware/registrationValidation.js";
import { API_BASE_PATH } from "../config/apiConfig.js";
import getUserInfo from "./controllers/userInfoHandler.js";

const usersRoutes = express.Router();

const saltRounds = 10;

const api = API_BASE_PATH + "users/";

//register
usersRoutes.post(api, registerValidation, register);

usersRoutes.get(api + "balance", authFunc, async (req, res) => {
  const user = await User.findById(req.user.userId, "balance").exec();
  return res.status(200).send({ balance: user.balance });
});

//usersRoutes.post(api + "transactions", authFunc, postTransactions);

//usersRoutes.get(api + "transactions", authFunc, getTransactions);

usersRoutes.get(api + "user-info", authFunc, getUserInfo);

export default usersRoutes;
