const mongoose = require("mongoose");

const ChatsSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  isGroupChat: {
    type: Boolean,
    defaut: false,
  },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  latestmessages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
  }],
  createAt: {
    type: Date,
    default: Date.now,
  },
});
const Chats = mongoose.model("Chats", ChatsSchema);
module.exports = Chats;
