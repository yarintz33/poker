import express from "express";
import { authFunc } from "../middleware/authenticationHandler.js";
import { refreshAuth } from "../middleware/authenticationHandler.js";
import refreshToken from "./controllers/refreshTokenHandler.js";
import { registrationAuth } from "../middleware/authenticationHandler.js";
import confirmation from "./controllers/confirmationHandler.js";
import { API_BASE_PATH } from "../config/apiConfig.js";
import refreshCode from "./controllers/refreshCodeHandler.js";
const authenticationRoutes = express.Router();

const api = API_BASE_PATH;

authenticationRoutes.get(api + "verify-token", authFunc, async (req, res) => {
  console.log("verification succeed!");
  return res.status(200).send("verification succeed!");
});

authenticationRoutes.post(api + "refresh", refreshAuth, refreshToken);

authenticationRoutes.post(
  api + "registeration/confirmation",
  registrationAuth,
  confirmation
);

authenticationRoutes.post(
  api + "registeration/resend-code",
  registrationAuth,
  refreshCode
);

export default authenticationRoutes;
