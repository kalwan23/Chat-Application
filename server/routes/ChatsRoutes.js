const express = require("express");
const ChatRouter = express.Router();
const AuthMiddleware = require("../Middlewares/authMiddleware");
const {
  CreateOneOnechat,
  CreateGroupChat,
  SendMessage,
  GetMessage,
  GetAllChats,
} = require("../controllers/ChatControllers");

ChatRouter.post("/createchat", AuthMiddleware, CreateOneOnechat);
ChatRouter.get("/getallchats", AuthMiddleware, GetAllChats);
ChatRouter.post("/creategroup", AuthMiddleware, CreateGroupChat);
ChatRouter.post("/send/:chatId", AuthMiddleware, SendMessage);
ChatRouter.get("/get/:chatId", AuthMiddleware, GetMessage);


module.exports = ChatRouter;
