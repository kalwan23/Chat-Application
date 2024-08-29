const express = require("express");
const UserRouter = express.Router();
const {
  Signup,
  Login,
  SearchUser,
} = require("../controllers/UsersControllers");
const AuthMiddleware = require("../Middlewares/authMiddleware");
UserRouter.post("/signup", Signup);
UserRouter.post("/login", Login);
UserRouter.get("/getusers/:username", AuthMiddleware, SearchUser);

module.exports = UserRouter;
