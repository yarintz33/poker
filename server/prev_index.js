import express from "express";
import cors from "cors";
import cookieparser from "cookie-parser";
import userRoutes from "./routes/users.js";
import loginRoutes from "./routes/login.js";
import authenticationRoutes from "./routes/authentications.js";

const app = express();
app.use(cookieparser());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(userRoutes);
app.use(loginRoutes);
app.use(authenticationRoutes);

const server = app.listen(5000, () => {
  console.log("Express App running at http://localhost:5000");
});

export default server;
