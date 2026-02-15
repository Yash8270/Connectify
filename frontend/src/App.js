import React, { useContext } from "react";
import {
  Routes,
  Route,
  BrowserRouter as Router,
  useLocation,
} from "react-router-dom";

import Home from "./components/Home";
import About from "./components/About";
import Login from "./components/Login";
import Showcase from "./components/Showcase";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Shownav from "./components/Shownav";
import Profile from "./components/Profile";
import Chat from "./components/Chat";
import ConnectContext from "./context/Connectcontext";
import Userprofile from "./components/Userprofile";
import Update from "./components/Update";


// -------------------- ROUTES COMPONENT --------------------
const AppRoutes = () => {
  const location = useLocation();
  const { authdata } = useContext(ConnectContext);

  const isPublicRoute =
    location.pathname === "/" ||
    location.pathname === "/about" ||
    location.pathname === "/login";

  return (
    <>
      {/* NAVBAR SWITCH */}
      {isPublicRoute ? <Navbar /> : <Shownav />}

      <Routes>
        {/* ---------- PUBLIC ROUTES ---------- */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />

        {/* ---------- PROTECTED ROUTES ---------- */}
        <Route
          path="/showcase/:userid"
          element={
            <ProtectedRoute>
              <Showcase />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/:userid"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat/:userid"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        <Route
          path="/userprofile/:userid"
          element={
            <ProtectedRoute>
              <Userprofile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/update"
          element={
            <ProtectedRoute>
              <Update />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};


// -------------------- MAIN APP --------------------
const App = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;
