import { User } from "../../models/mongoSchemas.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { API_BASE_PATH } from "../../config/apiConfig.js";

const login = async (req, res, next) => {
  //get user id...
  const { email, password } = req.body;
  const user = await User.findOne({ email: email }, "password");
  if (!user) {
    return res.status(406).send("wrong email or password!");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (valid === false) {
    res.status(406).send("wrong email or password!");
    return;
  }

  const refreshToken = jwt.sign(
    {
      userId: user._id,
      email: email,
    },
    process.env.REFRESH_TOKEN,
    { expiresIn: "3h" }
  );

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 3);

  await User.findByIdAndUpdate(user._id, {
    $push: {
      refreshTokens: {
        token: refreshToken,
        expiresAt: expiresAt,
      },
    },
  });

  const accessToken = jwt.sign(
    {
      userId: user._id,
      email: email,
    },
    process.env.SECRET_KEY_USERS,
    {
      expiresIn: "1m",
    }
  );
  user["token"] = refreshToken;
  await user.save();

  res.cookie("refresh-auth_token", refreshToken, {
    httpOnly: true,
    sameSite: "Strict", //"None"?
    secure: true,
    path: API_BASE_PATH + "refresh",
    maxAge: 60 * 60 * 3 * 1000, // 3 hour
  });
  res.cookie("access-token", accessToken, {
    httpOnly: true,
    sameSite: "Lax", //"None"?q
    secure: true, //change to true in production
    maxAge: 1000 * 60 * 1, // 1 min
  });

  res.status(200).send({ message: "login successfully!" });
};

export default login;
