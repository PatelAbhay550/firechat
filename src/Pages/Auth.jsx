// Auth.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, storage } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../config/firebase";
import { BsUpload } from "react-icons/bs"; // Import the upload icon from react-icons
import styles from "./Auth.module.css";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If user is already authenticated, navigate to home
        navigate("/home");
      }
    });

    return () => {
      unsubscribe(); // Unsubscribe when the component unmounts
    };
  }, [navigate]);

  const handleToggle = () => {
    setIsLogin((prev) => !prev);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleDisplayNameChange = (e) => {
    setDisplayName(e.target.value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
  };

  const handleAuth = async () => {
    try {
      if (isLogin) {
        // Sign in
        await signInWithEmailAndPassword(auth, email, password);
        navigate("/home");
      } else {
        // Sign up
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // Upload profile image to Firebase Storage
        if (profileImage) {
          const storageRef = ref(storage, `profileImages/${user.uid}`);
          await uploadBytes(storageRef, profileImage);
          const downloadURL = await getDownloadURL(storageRef);

          // Save additional user data to Firestore with profile image URL
          await setDoc(doc(db, "userfc", user.uid), {
            displayName: displayName,
            email: user.email,
            profileImage: downloadURL,
            timestamp: serverTimestamp(),
          });
        } else {
          // Save additional user data to Firestore without profile image URL
          await addDoc(collection(db, "userfc"), {
            uid: user.uid,
            displayName: displayName,
            email: user.email,
            timestamp: serverTimestamp(),
          });
        }

        navigate("/home");
      }
    } catch (error) {
      console.error("Authentication Error:", error.message);
    }
  };

  const handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Save additional user data to Firestore with profile image URL
      await setDoc(doc(db, "userfc", user.uid), {
        displayName: user.displayName,
        email: user.email,
        profileImage: user.photoURL,
        timestamp: serverTimestamp(),
      });

      navigate("/home");
    } catch (error) {
      console.error("Google Authentication Error:", error.message);
    }
  };

  return (
    <div className={styles.authContainer}>
      <h2 className={styles.intro}>Welcome to Firechat</h2>
      <h2>{isLogin ? "Login" : "Sign Up"}</h2>
      {!isLogin && (
        <>
          <input
            type="text"
            placeholder="Name"
            value={displayName}
            onChange={handleDisplayNameChange}
          />
          <br />
          <label htmlFor="imageInput" className={styles.uploadLabel}>
            <BsUpload className={styles.uploadIcon} />
            Upload Profile Image
          </label>
          <input
            id="imageInput"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
        </>
      )}
      <br />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={handleEmailChange}
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={handlePasswordChange}
      />
      <br />
      <button className={styles.btn} onClick={handleAuth}>
        {isLogin ? "Login" : "Sign Up"}
      </button>
      <p onClick={handleToggle} className={styles.toggleButton}>
        {isLogin ? "Create an account" : "Already have an account? Login"}
      </p>
      <button onClick={handleGoogleAuth} className={styles.googleButton}>
        Sign in with Google
      </button>
    </div>
  );
};

export default Auth;
