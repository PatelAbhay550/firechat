// Chatarea.js
import React, { useEffect, useState } from "react";
import { AiOutlineMore } from "react-icons/ai";
import { FiSend } from "react-icons/fi";
import { BsImage } from "react-icons/bs";
import { GrEmoji } from "react-icons/gr";
import styles from "./Chatarea.module.css";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";

const Chatarea = ({ user, selectedUser }) => {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [messages, setMessages] = useState([]);

  // Function to get messages from local storage
  const getMessagesFromLocalStorage = () => {
    const localStorageKey = `chats_${auth.currentUser.uid}_${selectedUser.id}`;
    const storedMessages = localStorage.getItem(localStorageKey);
    return storedMessages ? JSON.parse(storedMessages) : [];
  };

  // Function to save messages to local storage
  const saveMessagesToLocalStorage = (newMessages) => {
    const localStorageKey = `chats_${auth.currentUser.uid}_${selectedUser.id}`;
    localStorage.setItem(localStorageKey, JSON.stringify(newMessages));
  };

  useEffect(() => {
    if (!selectedUser) return;

    // Get messages from local storage
    const localMessages = getMessagesFromLocalStorage();
    setMessages(localMessages);

    const messagesQuery = query(
      collection(db, "messages"),
      where("senderId", "in", [auth.currentUser.uid, selectedUser.id]),
      where("receiverId", "in", [auth.currentUser.uid, selectedUser.id]),
      orderBy("timestamp")
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(data);

      // Save messages to local storage
      saveMessagesToLocalStorage(data);
    });

    return () => unsubscribe();
  }, [selectedUser]);

  const handleSendMessage = async () => {
    try {
      if (!selectedUser) {
        console.error("Error sending message: No selected user");
        return;
      }

      const newMessage = {
        email: auth.currentUser.email,
        senderId: auth.currentUser.uid,
        receiverId: selectedUser.id,
        message,
        timestamp: new Date(),
      };

      // Update state
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      // Save updated messages to local storage
      saveMessagesToLocalStorage([...messages, newMessage]);

      // Add the new message to the Firestore collection
      await addDoc(collection(db, "messages"), newMessage);

      setMessage("");
      setImage(null);
    } catch (error) {
      console.error("Error sending message:", error.message);
    }
  };
  const handleEnterKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevents adding a newline
      handleSendMessage();
    }
  };
  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    setImage(URL.createObjectURL(selectedImage));
  };
  const timestampToDate = (timestamp) => {
    const seconds = timestamp.seconds;
    const nanoseconds = timestamp.nanoseconds || 0;
    const milliseconds = seconds * 1000 + nanoseconds / 1e6;
    return new Date(milliseconds);
  };
  return (
    <div className={styles["chatarea-container"]}>
      {/* Top Bar */}
      <div className={styles["top-bar"]}>
        <div className={styles["profile-info"]}>
          {user && (
            <>
              <img
                className={styles["profile-image"]}
                src={user.profileImage || "/user-profile.jpg"}
                alt="Profile"
              />
              <h3 className={styles["user-name"]}>{user.displayName}</h3>
            </>
          )}
        </div>
        <div
          className={styles["more-options"]}
          onClick={() => setShowMoreOptions(!showMoreOptions)}
        >
          <AiOutlineMore />
        </div>
        {showMoreOptions && (
          <div className={styles["options-dropdown"]}>
            <div>New Features Coming Soon</div>
            <div>Chats are end-to-end-encrypted</div>
            <div>Created with 💖 by Abhay</div>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className={styles["chat-area"]}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles["message"]} ${
              msg.senderId === auth.currentUser.uid
                ? styles["message-sent"]
                : styles["message-received"]
            }`}
          >
            <p>{`${msg.message} `}</p>
            <p style={{ fontSize: "8px", color:'#555' }}> by {msg.email}</p>
            <p>
              {msg.timestamp instanceof Object
                ? timestampToDate(msg.timestamp).toLocaleString()
                : "Invalid Date"}
            </p>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className={styles["message-input"]}>
        
        <textarea
          placeholder="Type a message..."
          onKeyDown={handleEnterKeyPress}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={1}
          style={{ height: "auto", minHeight: "36px", maxHeight: "120px" }}
        />
        <FiSend className={styles["send-icon"]} onClick={handleSendMessage} />
      </div>
    </div>
  );
};

export default Chatarea;
