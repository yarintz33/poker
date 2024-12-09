import jwt from "jsonwebtoken";
import { User } from "../models/mongoSchemas.js";

function authFunc(req, res, next) {
  if (auth("access-token", process.env.SECRET_KEY_USERS, req, res)) {
    next();
  } else {
    res
      .status(401)
      .json({ message: "Access Denied. No / Invalid access token." });
  }
}

function registrationAuth(req, res, next) {
  if (auth("registration_token", process.env.REGISTRATION_KEY, req, res)) {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Access Denied. No / Invalid registration token." });
  }
}

async function refreshAuth(req, res, next) {
  if (auth("refresh-auth_token", process.env.REFRESH_TOKEN, req, res)) {
    const user = await User.findOne({
      _id: req.user.userId,
      "refreshTokens.token": req.cookies?.["refresh-auth_token"],
    });

    if (!user || new Date().getTime() / 1000 > req.user.exp) {
      console.log("cant find user with token or token expired");
      return res.status(403).json({ message: "Invalid refresh token" });
    } else {
      console.log("refresh token is valid");
    }
    next();
  } else {
    res
      .status(403)
      .json({ message: "Access Denied. No / Invalid refresh token." });
  }
}

function auth(tokenName, tokenKey, req, res) {
  const token = req.cookies?.[tokenName];
  if (!token) {
    // if (req.hasAuthorizationHeader()) {
    //   // Handle privileged server request
    //   const token = request.getHeader("Authorization").split(" ")[1];
    //   validateToken(token, req, res, next);
    // } else {
    console.log("no access token..");
    return false;
    //}
  }

  try {
    const decoded = jwt.verify(token, tokenKey); // Verify token
    req.user = decoded;
    return true;
  } catch (err) {
    console.log("failed decode 403");
    return false;
  }
}

export { authFunc, registrationAuth, refreshAuth };
