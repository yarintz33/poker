import { User, Transaction } from "../../models/mongoSchemas.js";
import mongoose from "mongoose";

const postTransactions = async (req, res, next) => {
  const user = await User.findById(req.user.userId, "email balance").exec();
  const { email, amount } = req.body;
  const otherEmail = email;

  if (user.balance < amount || amount < 0) {
    return res.status(406).send("not enoght money, get a job");
  }

  const otherUser = await User.findOne({ email: otherEmail }, "balance");

  if (!otherUser) {
    return res.status(406).send("user didn't dound");
  }
  const transaction = new Transaction({
    from: user.email,
    to: otherEmail,
    amount: amount,
    date: Date.now(),
  });
  const newBalance = user.balance - amount;
  const otherBalance = otherUser.balance + amount;
  const session = await mongoose.startSession(); // Start a session
  session.startTransaction(); // Start a transaction

  try {
    await transaction.save();

    // Update the first user's transactions
    await User.updateOne(
      { _id: user._id },
      {
        $push: { transactions: transaction._id },
        $set: { balance: newBalance },
      },
      { session }
    );

    // Update the second user's transactions
    await User.updateOne(
      { _id: otherUser._id },
      {
        $push: { transactions: transaction._id },
        $set: { balance: otherBalance },
      },
      { session }
    );

    // Commit the transaction
    await session.commitTransaction();
    console.log("Both updates were successful");
  } catch (error) {
    // Roll back the transaction on error
    await session.abortTransaction();
    console.error("Transaction failed, changes rolled back:", error);
  } finally {
    // End the session
    session.endSession();
  }

  return res.status(200).send({ message: "transaction succeed!" });
};

export default postTransactions;
