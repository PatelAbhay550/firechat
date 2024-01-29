import React from "react";
import Sidebar from "../components/Sidebar";
import Chatarea from "../components/Chatarea";

const Home = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <Sidebar />
    </div>
  );
};

export default Home;
