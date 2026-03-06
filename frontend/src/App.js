import React from "react";
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
import Userprofile from "./components/Userprofile";
import Update from "./components/Update";

// -------------------- ROUTES COMPONENT --------------------
const AppRoutes = () => {
  const location = useLocation();

  const isPublicRoute =
    location.pathname === "/" ||
    location.pathname === "/about" ||
    location.pathname === "/login";

  return (
    // ✅ GLOBAL LAYOUT WRAPPER
    // This applies the dark background, white text, and full height to EVERY page automatically.
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col font-sans">
      
      {/* NAVBAR SWITCH */}
      {isPublicRoute ? <Navbar /> : <Shownav />}

      {/* ✅ FLEX-1 CONTAINER */}
      {/* This ensures the content area stretches to fill whatever space is left below the navbar */}
      <div className="flex-1 flex flex-col w-full relative">
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
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat/:chatId"
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
      </div>
    </div>
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