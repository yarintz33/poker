import { Transaction, User } from "../../models/mongoSchemas.js";

const getUserInfo = async (req, res) => {
  const user = await User.findById(req.user.userId)
    .select("transactions firstName balance lastName")
    .populate("transactions")
    .exec();
  // const transactions = await Transaction.find({
  //   _id: { $in: user.transactions },
  // });
  return res.status(200).send({
    transactions: user.transactions,
    firstName: user.firstName,
    balance: user.balance,
    lastName: user.lastName,
  });
};

export default getUserInfo;
