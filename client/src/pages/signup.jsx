import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { CloudinaryContext, Image } from "cloudinary-react";
import { Cloudinary } from "cloudinary-core";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setProfileImage] = useState(null);
  const navigate = useNavigate();

  const update = (e) => {
    const { name, value, files } = e.target;
    if (name === "username") setUsername(value);
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
    if (name === "confirmPassword") setConfirmPassword(value);
    if (name === "phone") setPhone(value);
    if (name === "image") setProfileImage(files[0]);
  };

  const uploadImage = async (image) => {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "chat-app");
    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dccgfw5xa/image/upload",
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      console.error("Error uploading image to Cloudinary", error);
      toast.error("Failed to upload profile image");
      return null;
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    let imageUrl = null;
    if (image) {
      imageUrl = await uploadImage(image);
      console.log(imageUrl);
      if (!imageUrl) {
        return;
      }
    }

    const user = {
      username,
      email,
      phone,
      password,
      confirmpassword: confirmPassword,
      image: imageUrl,
    };

    console.log(user);

    try {
      const res = await axios.post("https://express-real-time-chat.onrender.com/users/signup", user, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (res.status === 201) {
        toast.success(res.data.message);
        navigate("/login");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error occurred, Signup failed");
      }
    }
  };

  return (
    <div className="container">
      <Toaster />
      <div className="form-container">
        <h1>Sign Up</h1>
        <form onSubmit={submit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={username}
            onChange={update}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={update}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={update}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={update}
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={phone}
            onChange={update}
          />
          <input type="file" name="image" onChange={update} />
          <button type="submit">Sign Up</button>
        </form>
        <Link to="/login" className="signup-link">
          Already have an account? Login
        </Link>
      </div>
    </div>
  );
};

export default Signup;
