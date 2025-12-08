import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Connect_Context from "../context/Connectcontext";
import Post from "./Post";
import Update from "./Update";
import Cookies from "js-cookie";
import Request from "../assets/request.svg";
import chat from "../assets/chat.svg";

const Shownav = () => {
  const context = useContext(Connect_Context);
  const {
    authdata,
    searchuser,
    setfollowname,
    nfollow,
    socket,
    idtouser,
    nchat,
    followreq,
    notification,
  } = context;

  const [showPostModal, setShowPostModal] = useState(false);
  const [showReqModal, setShowReqModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [reqname, setreqname] = useState({ usernames: [] });

  const navigate = useNavigate();

  useEffect(() => {
    const request_update = async () => {
      if (followreq?.length > 0) {
        const useridarray = followreq.map((request) => request.from);
        const usernames = await idtouser(useridarray);
        setreqname(usernames);
      }
    };
    request_update();
  }, [followreq, idtouser]);

  useEffect(() => {
    if (socket && authdata?.userid)
      socket.emit("registerUser", authdata.userid);
  }, [socket, authdata?.userid]);

  useEffect(() => {
    notification?.();
    socket?.on("notif", () => notification?.());
    return () => socket?.off("notif");
  }, [socket, notification]);

  const handleInputChange = (e) => {
    const input = e.target.value;
    setQuery(input);

    if (input && Array.isArray(searchuser)) {
      const filtered = searchuser.filter((u) =>
        u.username?.toLowerCase().includes(input.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 6));
    } else {
      setSuggestions([]);
    }
  };

  const handleUserClick = (user) => {
    setQuery("");
    setfollowname(user.username);
    setSuggestions([]);
    navigate(`/userprofile/${user._id}`);
    setSidebarOpen(false);
  };

  const toggleSidebar = () => setSidebarOpen((s) => !s);
  const closeSidebar = () => setSidebarOpen(false);
  const togglePostModal = () => setShowPostModal((s) => !s);
  const toggleReqModal = () => setShowReqModal((s) => !s);

  const handleCookie = () => {
    Object.keys(Cookies.get()).forEach((name) => Cookies.remove(name));
    closeSidebar();
    navigate("/");
  };

  return (
    <>
      {/* ✅ FIXED BLACK NAVBAR */}
      <header className="fixed top-0 left-0 w-full bg-[#0f0f0f] z-50 border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center gap-6">

          {/* LEFT TEXT */}
          <div className="min-w-[160px] shrink-0 text-white font-semibold">
            Welcome {Cookies.get("username")}
          </div>

          {/* SEARCH */}
          <div className="flex flex-grow justify-center min-w-0">
            <div className="relative w-full max-w-[680px]">
              <input
                id="searchuser"
                value={query}
                onChange={handleInputChange}
                className="w-full bg-[#1a1a1a] placeholder-gray-400 text-white rounded-full py-2.5 px-4 border border-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                placeholder="Search users"
              />

              {suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 mt-2 bg-[#1a1a1a] rounded-lg shadow-md max-h-56 overflow-auto z-50 border border-white/10">
                  {suggestions.map((user, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleUserClick(user)}
                      className="px-4 py-2 hover:bg-[#252525] cursor-pointer text-white"
                    >
                      {user.username || "No username"}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* RIGHT BUTTONS */}
          <div className="flex items-center gap-4 shrink-0">

            {/* DESKTOP: POST */}
            <button
              onClick={togglePostModal}
              className="hidden md:flex bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Post
            </button>

            {/* DESKTOP: BACK */}
            <Link
              to={`/showcase/${authdata?.userid}`}
              className="hidden md:flex bg-[#1a1a1a] text-white px-4 py-2 rounded-lg hover:bg-[#232323] transition"
            >
              Back
            </Link>

            {/* DESKTOP: LOGOUT */}
            <button
              onClick={handleCookie}
              className="hidden md:flex border border-yellow-400 text-yellow-400 px-4 py-2 rounded-lg hover:bg-yellow-400 hover:text-black transition font-semibold"
            >
              Logout
            </button>

            {/* REQUESTS */}
            <div className="relative">
              <button
                onClick={toggleReqModal}
                className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center"
              >
                <img src={Request} alt="req" className="w-5 h-5" />
              </button>
              {nfollow > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-black w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                  {nfollow}
                </span>
              )}
            </div>

            {/* CHAT */}
            <div className="relative">
              <Link to={`/chat/${authdata?.userid}`}>
                <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                  <img src={chat} alt="chat" className="w-5 h-5" />
                </div>
              </Link>
              {nchat > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-black w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                  {nchat}
                </span>
              )}
            </div>

            {/* MOBILE MENU */}
            <button
              onClick={toggleSidebar}
              className="ml-2 md:hidden px-2 py-1 text-2xl text-white"
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* ✅ GLOBAL NAVBAR SPACER */}
      <div className="h-20"></div>

      {/* ✅ MOBILE SIDEBAR */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-[#0f0f0f] text-white transform transition-transform duration-300 z-40 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <div className="font-bold text-lg">Menu</div>
          <button onClick={closeSidebar} className="text-2xl">
            &times;
          </button>
        </div>

        <div className="flex flex-col gap-4 p-4">

          {/* MOBILE: POST */}
          <button
            onClick={() => {
              togglePostModal();
              closeSidebar();
            }}
            className="w-full text-center bg-yellow-400 text-black py-2 rounded-lg font-semibold hover:opacity-90"
          >
            Post
          </button>

          {/* MOBILE: BACK */}
          <Link
            to={`/showcase/${authdata?.userid}`}
            onClick={closeSidebar}
            className="w-full text-center bg-[#1a1a1a] hover:bg-[#232323] py-2 rounded-lg font-semibold text-white"
          >
            Back
          </Link>

          {/* MOBILE: LOGOUT */}
          <button
            onClick={handleCookie}
            className="w-full text-center py-2 rounded-lg font-semibold border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
          >
            Logout
          </button>
        </div>
      </div>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* MODALS */}
      <Update
        showreq={showReqModal}
        setshowreq={setShowReqModal}
        reqname={reqname}
      />

      <Post show={showPostModal} setShow={setShowPostModal} />
    </>
  );
};

export default Shownav;
