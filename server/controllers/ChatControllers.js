const mongoose = require("mongoose");
const User = require("../models/users");
const Chats = require("../models/chats");
const Message = require("../models/message");

const CreateOneOnechat = async (req, res) => {
  const user1Id = req.user.userId;
  const { user2Id } = req.body;
  const { name } = req.body;

  try {
    const user1 = await User.findById(user1Id);
    const user2 = await User.findById(user2Id);

    if (!user1 || !user2) {
      return res.status(404).json({ message: "Users not Found" });
    }

    const existChat = await Chats.findOne({
      isGroupChat: false,

      members: { $all: [user1Id, user2Id] },
    });

    if (existChat) {
      return res.status(200).json({ message: "Chat already exists" });
    }

    const newChat = new Chats({
      isGroupChat: false,
      name: user2.username,
      members: [user1Id, user2Id],
    });
     
    const data=await newChat.save();
    res.status(201).json({ message: "Chat created",data});
  } catch (err) {
    console.error("Error creating chat:", err);
    res.status(500).json({ message: err.message });
  }
};

const CreateGroupChat = async (req, res) => {
  const { name, members } = req.body;
  const loggedInuser = req.user.userId;
  members.push(loggedInuser);
  try {
    
    const newGroup = new Chats({
      name,
      isGroupChat: true,
      members,
    });
    await newGroup.save();
    res.status(201).json({ message: "Group chat created" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

const SendMessage = async (req, res) => {
  const sender = req.user.userId;
  const { content } = req.body;
  const chat = req.params.chatId;

  try {
    const newMessage = new Message({
      sender,
      content,
      chat,
    });

    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const GetMessage = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "-password")
      .populate("chat");
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const GetAllChats = async (req, res) => {
  try {
    const loggedInUserId = req.user.userId;
    const Allchats = await Chats.find({
      members: { $in: [loggedInUserId] },
    }).populate("members", "-password"); // Populate members with all details except password

    res.status(200).json(Allchats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  CreateOneOnechat,
  CreateGroupChat,
  SendMessage,
  GetMessage,
  GetAllChats,
};
