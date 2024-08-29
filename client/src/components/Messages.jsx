import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../styles/chat.scss";
import toast from "react-hot-toast";
import io from "socket.io-client";

const Messages = ({ chat_id }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const loggedInUserId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const imageurl = localStorage.getItem("img");

  // Reference to the message container to control scroll
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `https://chat-application-g3wa.vercel.app/users/chats/get/${chat_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (res.status === 200) {
          setMessages(res.data);
          console.log(res.data);
        } else {
          toast.error(res.data.message);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [chat_id, token]);

  useEffect(() => {
    const socket = io("https://chat-application-g3wa.vercel.app");
    
    socket.emit("join_chat", chat_id);
   
    socket.on("receive_message", (message) => {
      console.log(message);
      setMessages((oldmsg) => [...oldmsg, message]);
    });
     
    return () => {
      socket.disconnect();
    };
  }, [chat_id]);

  // Scroll to the bottom whenever messages are updated
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") {
      return;
    }

    try {
      const res = await axios.post(
        `https://chat-application-g3wa.vercel.app/users/chats/send/${chat_id}`,
        {
          content: newMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const socket = io("https://chat-application-g3wa.vercel.app");
      if (res.status === 201) {
        socket.emit("send_message", {
          _id: chat_id,
          sender: { _id: loggedInUserId, image: imageurl },

          content: newMessage,
        });
        setNewMessage("");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent the default action (e.g., form submission)
      handleSendMessage();
    }
  };

  return (
    <div className="messages_container">
      <div className="messages">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`message_item ${
              message.sender._id === loggedInUserId ? "right" : "left"
            }`}
          >
            <div className="senderProfile">
              <img src={message.sender.image} alt="" />
            </div>
            <div className="message_content">{message.content}</div>
          </div>
        ))}
        {/* Dummy div to ensure scrolling to the last message */}
        <div ref={messagesEndRef}></div>
      </div>
      <div className="chat_input">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Messages;
