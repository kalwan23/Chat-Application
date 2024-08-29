const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: Number,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default:
      "data:image/jpeg;base64,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",
  },
  createdAt: { 
    type: Date, default: Date.now 
  },
});

userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword.toString(), this.password);
  } catch (err) {
    throw new Error(err);
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
