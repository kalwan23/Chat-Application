import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import "./styles/searchbox.scss";
import toast from "react-hot-toast";
import axios from "axios";
import io from "socket.io-client";

const SearchBox = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState("");
  const [results, setResults] = useState([]);
  const loggedInUserId = localStorage.getItem("userId");

  const searchUser = async (username) => {
    if (username) {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `https://express-real-time-chat.onrender.com/users/getusers/${username}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.status === 200) {
          setResults(res.data);
        } else {
          toast.error(res.data.message);
          setResults([]);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
        toast.error(error.response.data.message);
        setResults([]);
      }
    } else {
      setResults([]);
    }
  };

  const update = (e) => {
    const username = e.target.value;
    setUsername(username);
    searchUser(username);
  };

  const createChat = async (user2Id, username) => {
    const token = localStorage.getItem("token");

    const chatData = {
      name: username,
      user2Id,
    };

    try {
      const res = await axios.post(
        "https://express-real-time-chat.onrender.com/users/chats/createchat",
        chatData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (res.status === 201) {
        // Socket.IO implementation
        const chat_id = res.data.data._id;
        const socket = io("https://express-real-time-chat.onrender.com");
        socket.emit("Created_chat", chat_id);

        toast.success(res.data.message);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error occurred while creating chat");
      }
    }
  };

  return (
    <div className={`searchbox ${isOpen ? "open" : ""}`}>
      <div className="searchbox-header">
        <input
          type="text"
          placeholder="Search"
          value={username}
          onChange={update}
        />
        <FaTimes className="close-icon" onClick={onClose} />
      </div>
      <div className="searchbox-results">
        <ol>
          {results.map((user) => (
            <li
              key={user._id}
              onClick={() => createChat(user._id, user.username)}
            >
              {user.username}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default SearchBox;
