import {
  validateEmail,
  validatePassword,
  allLetter,
} from "../services/validation.js";

function registerValidation(req, res, next) {
  const { firstName, lastName, email, plainPass } = req.body;
  if (
    validateEmail(email) &&
    validatePassword(plainPass) &&
    allLetter(firstName) &&
    allLetter(lastName)
  ) {
    next();
  } else {
    console.log("didn't pass validation");
    res.status(400).send("Validation failed");
  }
}

export default registerValidation;
