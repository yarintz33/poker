import { Transaction, User } from "../../models/mongoSchemas.js";

const getTransactions = async (req, res) => {
  const user = await User.findById(req.user.userId)
    .select("transactions")
    .populate("transactions")
    .exec();

  const transactions = user.transactions;
  return res.status(200).send({ transactions: transactions });
};

export default getTransactions;
