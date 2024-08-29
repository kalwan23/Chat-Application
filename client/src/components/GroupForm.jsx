import React, { useState } from "react";
import axios from "axios";
import "../styles/chat.scss";
import "./styles/GroupForm.scss";
import toast from "react-hot-toast";
import io from "socket.io-client";

const GroupForm = ({ onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const token = localStorage.getItem("token");

  const handleGroupNameChange = (e) => {
    setGroupName(e.target.value);
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    handleSearch(term);
  };

  const handleSearch = async (searchTerm) => {
    if (searchTerm) {
      try {
        const res = await axios.get(
          `https://chat-application-g3wa.vercel.app/users/getusers/${searchTerm}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setSearchResults(res.data);
      } catch (error) {
        console.error("Error searching users:", error);
        toast.error(error.response.data.message);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const addMember = (user) => {
    if (!members.some((member) => member._id === user._id)) {
      setMembers([...members, user]);
      setSearchResults([]);
      setSearchTerm("");
    }
  };

  const removeMember = (userId) => {
    setMembers(members.filter((member) => member._id !== userId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting group:", { groupName, members });

    const memberIds = members.map((member) => member._id);

    if (memberIds.length >= 1) {
      try {
        const res = await axios.post(
          "https://chat-application-g3wa.vercel.app/users/chats/creategroup",
          {
            name: groupName,
            members: memberIds,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("API response:", res);

        if (res) {
          if (res.status === 201) {
            const socket = io("https://chat-application-g3wa.vercel.app");
            socket.emit("Group_created", { msg: "groupfromed" });
            toast.success("Group chat created successfully");
            setGroupName("");
            setMembers([]);
            onClose(); // Use onClose instead of setIsGroup
          } else {
            toast.error(res.data.message || "Failed to create group");
          }
        } else {
          toast.error("Unexpected response format");
        }
      } catch (error) {
        console.error("Error creating group chat:", error);
        const errorMessage = error.response?.data?.message || "An error occurred";
        toast.error(errorMessage);
      }
    } else {
      toast.error("Select at least one user");
    }
  };

  const handleClose = () => {
    onClose(); // Use onClose instead of setIsGroup
  };

  return (
    <div className="groupform">
      <button className="close-btn" onClick={handleClose}>
        &times;
      </button>
      <h2>Create Group Chat</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="GroupName">Group Name</label>
        <input
          type="text"
          id="GroupName"
          value={groupName}
          onChange={handleGroupNameChange}
        />
        <div className="userselceted">
          <ul>
            {members.map((member) => (
              <li key={member._id}>
                {member.username}
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeMember(member._id)}
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="searchuser">
          <input
            type="text"
            placeholder="Search User"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <div className="displaysearch">
            {searchResults.length > 0 && (
              <div className="searchresults">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    className="searchresult"
                    onClick={() => addMember(user)}
                  >
                    {user.username}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <button type="submit">Create Group</button>
      </form>
    </div>
  );
};

export default GroupForm;
