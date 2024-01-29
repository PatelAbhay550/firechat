import "./App.css";
import Auth from "./Pages/Auth";
import Home from "./Pages/Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Auth />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
