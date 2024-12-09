import { User, UnAuthUser } from "../../models/mongoSchemas.js";
import jwt from "jsonwebtoken";
import { API_BASE_PATH } from "../../config/apiConfig.js";

export default async function confirmation(req, res) {
  console.log("here in confirmation");
  const bodyCode = req.body.code;
  try {
    const { email, firstName, lastName, password, code } =
      await UnAuthUser.findById(req.user.userId).exec();
    const newUser = new User({
      email,
      firstName,
      lastName,
      password,
      transaction: new Array(),
      balance: 0,
    });

    await newUser.save();
    await UnAuthUser.deleteOne({ _id: req.user.userId });
    // const accessToken = jwt.sign(
    //   {
    //     userId: newUser._id,
    //     email: email,
    //   },
    //   process.env.SECRET_KEY_USERS,
    //   {
    //     expiresIn: "5m",
    //   }
    // );

    // res.cookie("access-token", accessToken, {
    //   httpOnly: true,
    //   sameSite: "Strict", //"None"?q
    //   secure: true,
    //   //path: "/",
    //   maxAge: 60 * 1000, // 1 min
    // });

    res.status(200).send("ok body!");
  } catch (error) {
    return res.status(500).send("server error");
  }
  if (code != bodyCode) {
    return res.status(406).send("incorrect code");
  }
}
