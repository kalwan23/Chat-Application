require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const path=require("path");
const { Server } = require("socket.io");

const UserRouter = require("./routes/UsersRoutes");
const ChatRouter = require("./routes/ChatsRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['https://chat-application-seven-alpha.vercel.app'],
    methods: ["GET", "POST", "PUT"],
    credentials: true,
  },
});

// Middleware
app.use(express.json());
const corOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};
app.use(cors(corOptions));

// MongoDB Connection
const mongoUri = process.env.MONGODB_URL;
mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB");
    console.error(err);
  });

// Deployment 
app.get("/", (req, res) => {
  app.use(express.static(path.resolve(__dirname, "client", "build")));
  res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
});


app.use("/users", UserRouter);
app.use("/users/chats", ChatRouter);



// Set up Socket.IO
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join_chat", (chat_id) => {
    socket.join(chat_id);
    console.log(`User with ID: ${socket.id} joined chat: ${chat_id}`);
  });

  socket.on("send_message", (data) => {
    const { _id, sender, content } = data;
    io.to(_id).emit("receive_message", { _id, sender, content });
  });

  socket.on("Created_chat", (chat_id) => {
    socket.join(chat_id);
    console.log(
      `User created chat with ID: ${socket.id} joined chat: ${chat_id}`
    );
    io.emit("newChat", { chat_id });
  });
  socket.on("Group_created", (data) => {
    io.emit("newGroup", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
server.listen(process.env.PORT || 8000, () => {
  console.log(`Listening on port ${process.env.PORT || 8000}`);
});

// Store the socket.io instance for use in routes
app.set("socketio", io);
