import { User, Transaction, UnAuthUser } from "../../models/mongoSchemas.js";
import mongoose from "mongoose";
import sendEmail from "../../nodeMailer.js";
import Str_Random from "../../services/codeGenerator.js";
const refreshCode = async (req, res, next) => {
  const code = Str_Random(6);
  const email = req.user.email;
  await UnAuthUser.findByIdAndUpdate(req.user.userId, {
    $set: { code: code },
  });
  console.log(email);
  sendEmail("yarintz33@gmail.com", code); // change to email...
  res.status(200).json({ message: "code sent" });
};

export default refreshCode;
