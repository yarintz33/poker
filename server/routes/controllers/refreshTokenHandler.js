import jwt from "jsonwebtoken";
import { API_BASE_PATH } from "../../config/apiConfig.js";
import { User } from "../../models/mongoSchemas.js";

const refreshToken = async (req, res, next) => {
  console.log("in api refreshToken");
  try {
    const decoded = req.user;
    const oldRefreshToken = req.cookies["refresh-auth_token"];
    const accessToken = jwt.sign(
      {
        userId: decoded.userId,
        email: decoded.email,
      },
      process.env.SECRET_KEY_USERS,
      {
        expiresIn: "1m",
      }
    );

    const newRefreshToken = jwt.sign(
      {
        userId: decoded.userId,
        email: decoded.email,
      },
      process.env.REFRESH_TOKEN,
      {
        expiresIn: "3h",
      }
    );

    await User.findByIdAndUpdate(decoded.userId, {
      $pull: { refreshTokens: { token: oldRefreshToken } },
    });

    await User.findByIdAndUpdate(decoded.userId, {
      $push: {
        refreshTokens: {
          token: newRefreshToken,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 60 * 60 * 3 * 1000),
        },
      },
    });

    res.cookie("access-token", accessToken, {
      httpOnly: true,
      sameSite: "Strict",
      secure: true,
      maxAge: 60 * 1 * 1000,
    });

    res.cookie("refresh-auth_token", newRefreshToken, {
      httpOnly: true,
      sameSite: "Strict",
      secure: true,
      path: API_BASE_PATH + "refresh",
      maxAge: 60 * 60 * 3 * 1000,
    });

    return res.json("New tokens sent in cookies");
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export default refreshToken;
