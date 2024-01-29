import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import styles from "./Sidebar.module.css";
import { onAuthStateChanged } from "firebase/auth";
import firechatLogo from "../assets/fire.svg";
import { auth, db } from "../config/firebase";
import Chatarea from "./Chatarea";

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const userAuth = auth.currentUser;
      if (userAuth) {
        try {
          const querySnapshot = await getDocs(collection(db, "userfc"));

          querySnapshot.forEach((doc) => {
            if (doc.id === userAuth.uid) {
              setUser(doc.data());
            }
          });
        } catch (error) {
          console.error("Error fetching user data:", error.message);
        }
      }
    };

    const fetchAllUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "userfc"));
        const users = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setContacts(users);
      } catch (error) {
        console.error("Error fetching all users:", error.message);
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (userAuth) => {
      if (userAuth) {
        fetchUserData();
        fetchAllUsers();
      } else {
        setUser(null);
        setContacts([]);
        setSelectedUser(null);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, [user]);

  const handleUserClick = (clickedUser) => {
    setSelectedUser(clickedUser);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.main}>
      <div className={styles["sidebar-container"]}>
        <div className={styles["sidebar-header"]}>
          <img
            className={styles["app-logo"]}
            src={firechatLogo}
            alt="Firechat"
          />
          <h2 className={styles["app-name"]}>Firechat</h2>
        </div>
        {user && (
          <div className={styles["user-info"]}>
            <img
              className={styles["user-profile-image"]}
              src={user.profileImage || "/vite.svg"}
              alt="Profile"
            />
            <div className={styles["user-details"]}>
              <h4>{user.displayName}</h4>
            </div>
          </div>
        )}

        <div className={styles["search-bar"]}>
          <input
            type="text"
            placeholder="Search accounts"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className={styles["contact-item"]}
            onClick={() => handleUserClick(contact)}
          >
            <img
              className={styles["profile-image"]}
              src={contact.profileImage}
              alt={contact.displayName}
            />
            <div className={styles["contact-details"]}>
              <h4>{contact.displayName}</h4>
              {/* Add logic to show the last message and time */}
              <p>{/* contact.lastMessage */}</p>
            </div>
            <div className={styles["message-time"]}>
              {/* Add logic to show the last message time */}
            </div>
          </div>
        ))}
      </div>
      {selectedUser && (
        <>
          <div className={styles.chatarea}>
            {/* Pass selectedUser as a prop to Chatarea component */}
            <Chatarea user={selectedUser} selectedUser={selectedUser} />
          </div>
        </>
      )}
      {!selectedUser && (
        <>
          <div className={styles.nosel}>
            <h2>Welcome To Firechat!</h2>
            <p>Chat with Friends by searching or Clicking Their name</p>
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
