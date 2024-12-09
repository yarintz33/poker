import { UnAuthUser, User } from "../../models/mongoSchemas.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import sendEmail from "../../nodeMailer.js";
import { API_BASE_PATH } from "../../config/apiConfig.js";
import Str_Random from "../../services/codeGenerator.js";

const saltRounds = 10;

const register = async (req, res, next) => {
  const { firstName, lastName, email, plainPass } = req.body;

  const user = await User.findOne({ email: email });
  if (user) {
    return res.status(409).send("email already exists!");
  }
  let password;
  try {
    const salt = await bcrypt.genSalt(saltRounds);

    password = await bcrypt.hash(plainPass, salt);
  } catch (err) {
    console.log(err);
    throw err;
  }
  const code = Str_Random(6);

  const unAuthUser = new UnAuthUser({
    email,
    firstName,
    lastName,
    password,
    code,
    // transaction: new Array(),
    // balance: 0,
  });

  try {
    await unAuthUser.save();
  } catch (err) {
    console.log(err);
    //return next(err);
    return res.status(400).send({ message: "email already exist in db!" });
  }

  try {
    let registration_token = jwt.sign(
      {
        userId: unAuthUser.id,
        email: unAuthUser.email,
      },
      process.env.REGISTRATION_KEY,
      { expiresIn: "5m" }
    );

    res.cookie("registration_token", registration_token, {
      httpOnly: true,
      sameSite: "Strict",
      secure: true,
      path: API_BASE_PATH + "registeration/",
      maxAge: 60 * 5 * 1000, // 5 minutes
    });

    sendEmail("yarintz33@gmail.com", code); //sendEmail(email, code);
  } catch (err) {
    console.log(err);
    return next(err);
  }

  res
    .status(200)
    .json({
      success: true,
    })
    .send();
};

export default register;
