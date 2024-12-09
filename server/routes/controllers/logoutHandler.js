import { User } from "../../models/mongoSchemas.js";

const logout = async (req, res) => {
  try {
    const accessToken = req.cookies["access-token"];

    // Remove the tokens from database
    await User.findByIdAndUpdate(req.user.userId, {
      $set: { refreshTokens: [] },
    });

    res.cookie("refresh-auth_token", "", {
      httpOnly: true,
      secure: true,
      expires: new Date(0),
    });
    res.cookie("access-token", "", {
      httpOnly: true,
      secure: true,
      expires: new Date(0),
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error during logout" });
  }
};

export default logout;
