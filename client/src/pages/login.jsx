import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css";
import toast from "react-hot-toast";
import axios from "axios";

const Login = () => {
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  function update(e) {
    const { name, value } = e.target;
    if (name === "email") setemail(value);
    if (name === "password") setPassword(value);
  }

  async function submit(e) {
    e.preventDefault();
    const user = { email, password };

    try {
      const res = await axios.post("http://localhost:8080/users/login", user, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
     
      if (res.status === 201) {
        console.log("Login successful:", res.data);
        toast.success(res.data.message);
        localStorage.setItem('username',res.data.username);
        localStorage.setItem('email',res.data.email);
        localStorage.setItem('img',res.data.img);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data.userId);
        navigate("/chat");
      } else {
        console.log("Login failed:", res);
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error("Error during login:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error occurred, Login failed");
      }
    }
  }

  return (
    <div className="container">
      <div className="form-container">
        <h1>Login</h1>
        <form onSubmit={submit}>
          <input
            type="text"
            name="email"
            placeholder="Enter your email"
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
          <button type="submit">Login</button>
        </form>
        <Link to="/signup" className="signup-link">
          Don't have an account? Sign Up
        </Link>
      </div>
    </div>
  );
};

export default Login;
