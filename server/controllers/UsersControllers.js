require('dotenv').config();
const User = require("../models/users");
const jwt = require("jsonwebtoken");
const Signup = async (req, res) => {
  const { username, email, phone, password, confirmpassword,image } = req.body;

  if (!username || !email || !phone || !password || !confirmpassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== confirmpassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const existuser = await User.findOne({
      $or: [{ email }, { username }, { phone }],
    });
    if (existuser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newuser = new User({
      username,
      email,
      phone,
      password,
      image,
    });

    await newuser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const Login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are neccesarry" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isvalidPassword = await user.comparePassword(password);
    if (!isvalidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = await jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      process.env.MY_SECRET_KEY,
      {
        expiresIn: "1d",
      }
    );
    res.status(201).json({ message: "LoggedIn SuccessFully", token: token ,userId:user._id,email:user.email,username:user.username,img:user.image});
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const SearchUser = async (req, res) => {
  try {
    const username = req.params.username;
    const users = await User.find({
      username: { $regex: username, $options: "i" }, // Case-insensitive regex search
    }).select("-password");

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json(users); // Return an array of users
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { Signup, Login, SearchUser };
