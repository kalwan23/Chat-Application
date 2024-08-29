import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaSearch, FaUser, FaSignOutAlt } from "react-icons/fa";
import axios from "axios";
import "../styles/chat.scss";
import SearchBox from "../components/SearchBox";
import Messages from "../components/Messages";
import GroupForm from "../components/GroupForm";
import ProfileDisplay from "../components/ProfileDisplay";
import toast from "react-hot-toast";
import io from "socket.io-client";

// Get profile image from local storage
const profileImg = localStorage.getItem("img");

const Chat = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [isGroup, setIsGroup] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const loggedInUserId = localStorage.getItem("userId");
  const [chatProfileUser, setChatProfileUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const socket = io("http://localhost:8080");
    socket.on("newChat", (chat_id) => {
      console.log("New chat created with chat-id:", chat_id);
      fetchChats(); // Re-fetch chats when a new chat is created
    });
    socket.on("newGroup", (data) => {
      console.log("New chat created with chat-id:", data);
      fetchChats(); // Re-fetch chats when a new chat is created
    });

    return () => {
      socket.off("newChat");
      socket.off("newGroup");
    };
  });

  const fetchChats = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("User is not authorized");
      return;
    }
    try {
      const res = await axios.get(
        "http://localhost:8080/users/chats/getallchats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.status === 200) {
        setChats(res.data);
        console.log("Fetched chats:", res.data);
      } else {
        console.error("Failed to fetch chats");
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchChats(); // Fetch chats when the component mounts
  }, [isOpen, isGroup, isProfileOpen]);

  const openSearch = () => {
    setIsOpen(true);
  };

  const closeSearch = () => {
    setIsOpen(false);
  };

  const fetchUserProfile = () => {
    const username = localStorage.getItem("username");
    const email = localStorage.getItem("email");
    const image = localStorage.getItem("img");

    setUserProfile({ username, email, image });
  };

  useEffect(() => {
    if (isProfileOpen && !userProfile) {
      fetchUserProfile();
    }
  }, [isProfileOpen]);

  const selectUser = (user) => {
    setSelectedUser(user);
    setChatProfileUser(null);
    setIsProfileOpen(false);

    if (!user.isGroupChat) {
      const profileUser = user.members.find(
        (member) => member._id !== loggedInUserId
      );
      setChatProfileUser(profileUser);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("img");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    toast.success("Logout Successful");
    navigate("/login");
  };

  return (
    <div className="chat_container">
      <div className="navbar">
        <div className="searchfield" onClick={openSearch}>
          <FaSearch className="search-icon" />
          <p>Search user</p>
        </div>
        <p>Talk-A-Tive</p>
        <div className="profile">
          <FaBell className="notification-bell" />
          <FaSignOutAlt className="logout-icon" onClick={handleLogout} />
          <img
            src={profileImg || "default-profile.png"}
            alt="Profile"
            className="profile-photo"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          />
        </div>
      </div>
      {isOpen && <SearchBox isOpen={isOpen} onClose={closeSearch} />}
      {isProfileOpen && userProfile && (
        <ProfileDisplay
          userProfile={userProfile}
          onClose={() => setIsProfileOpen(false)}
        />
      )}
      <div className="chat_box">
        <div className="left">
          <div className="header">
            <p>My Chats</p>
            <div className="g" onClick={() => setIsGroup(!isGroup)}>
              <p>
                New Group Chat <span>+</span>
              </p>
            </div>
          </div>
          <div className="user_list">
            {chats.map((chat) => (
              <div
                key={chat._id}
                className="user_item"
                onClick={() => selectUser(chat)}
              >
                <FaUser className="user_icon" />
                <p>
                  {!chat.isGroupChat
                    ? chat.members.find(
                        (member) => member._id !== loggedInUserId
                      )?.username
                    : chat.name}
                </p>
              </div>
            ))}
          </div>
          {isGroup && <GroupForm onClose={() => setIsGroup(false)} />}
        </div>
        <div className="right">
          <div className="chat_header">
            {selectedUser ? (
              <>
                <h2>
                  {selectedUser.isGroupChat
                    ? selectedUser.name
                    : selectedUser.members.find(
                        (member) => member._id !== loggedInUserId
                      )?.username}
                </h2>
                {!selectedUser.isGroupChat && (
                  <FaUser
                    className="user_icon"
                    onClick={() => setIsProfileOpen(true)}
                  />
                )}
              </>
            ) : (
              <h2>Select a chat to start messaging</h2>
            )}
          </div>
          {selectedUser ? (
            <Messages chat_id={selectedUser._id} />
          ) : (
            <div className="chat_placeholder">
              Click on a user to start the chat
            </div>
          )}
        </div>
      </div>
      {isProfileOpen && chatProfileUser && (
        <ProfileDisplay
          userProfile={chatProfileUser}
          onClose={() => setIsProfileOpen(false)}
        />
      )}
    </div>
  );
};

export default Chat;
