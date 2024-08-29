const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,  
  },
  content: {
    type: String,
    required: true,
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chats",
    required: true,
  }
}, {
  timestamps: true, 
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
