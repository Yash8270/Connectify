import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ConnectContext from "../context/Connectcontext";
import Post from "./Post";
import Update from "./Update";
import Cookies from "js-cookie";
import Request from "../assets/request.svg";
import chat from "../assets/chat.svg";

const Shownav = () => {
  const context = useContext(ConnectContext);
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
    only_followers,
    logout_fxn,
  } = context;

  const [showPostModal, setShowPostModal] = useState(false);
  const [showReqModal, setShowReqModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [reqname, setreqname] = useState({ usernames: [] });
  const [followback, setfollowback] = useState([]);

  // ✅ State for Profile Data in Sidebar
  const [profile, setProfile] = useState({
    username: "",
    profilepic: "",
    followers: 0,
    following: 0,
    bio: "",
  });

  const navigate = useNavigate();

  // ✅ Load Profile Data from Cookies
  useEffect(() => {
    setProfile({
      username: Cookies.get("username"),
      profilepic: Cookies.get("profile"),
      followers: Cookies.get("followers") || 0,
      following: Cookies.get("following") || 0,
      bio: Cookies.get("bio") || "No bio available",
    });
  }, [sidebarOpen]);

  useEffect(() => {
    const fetchData = async () => {
      if (only_followers) {
        const dont_f_back = await only_followers();
        setfollowback(dont_f_back || []);
      }
    };
    fetchData();
  }, [only_followers]);

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

  // ✅ FIXED: Check if searchuser is an array before calling .find()
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (!query.trim()) return;
      
      // Safety check to prevent the crash
      if (!Array.isArray(searchuser)) {
        alert("User not found");
        return;
      }

      // Find an exact (case-insensitive) match in the loaded users database
      const foundUser = searchuser.find(
        (u) => u.username?.toLowerCase() === query.trim().toLowerCase()
      );

      if (foundUser) {
        handleUserClick(foundUser);
      } else {
        alert("User not found");
      }
    }
  };

  const toggleSidebar = () => setSidebarOpen((s) => !s);
  const closeSidebar = () => setSidebarOpen(false);
  const togglePostModal = () => setShowPostModal((s) => !s);
  const toggleReqModal = () => setShowReqModal((s) => !s);

  const handleCookie = async () => {
    closeSidebar();
    await logout_fxn(); 
    navigate("/");      
  };

  return (
    <>
      {/* ✅ NAVBAR */}
      <header className="fixed top-0 left-0 w-full bg-[#0f0f0f] z-50 border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-3 md:px-6 py-3 flex items-center justify-between gap-2 md:gap-6">
          
          <div className="hidden md:block min-w-[160px] shrink-0 text-white font-semibold">
            Welcome {Cookies.get("username")}
          </div>

          <Link 
            to={`/showcase/${authdata?.userid}`}
            className="md:hidden flex items-center justify-center text-white p-2 -ml-2"
          >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
             </svg>
          </Link>

          <div className="flex-grow min-w-0 relative z-50">
            <div className="relative w-full md:max-w-[680px] mx-auto">
              <input
                id="searchuser"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown} 
                className="w-full bg-[#1a1a1a] placeholder-gray-400 text-white rounded-full py-2 px-4 border border-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition text-base"
                placeholder="Search..."
              />
              {suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 mt-2 bg-[#1a1a1a] rounded-lg shadow-xl max-h-60 overflow-auto border border-white/10">
                  {suggestions.map((user, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleUserClick(user)}
                      className="px-4 py-3 hover:bg-[#252525] cursor-pointer text-white border-b border-white/5 last:border-none"
                    >
                      {user.username || "No username"}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            <button onClick={togglePostModal} className="hidden md:flex bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition">
              Post
            </button>
            <Link to={`/showcase/${authdata?.userid}`} className="hidden md:flex bg-[#1a1a1a] text-white px-4 py-2 rounded-lg hover:bg-[#232323] transition">
              Back
            </Link>
            <button onClick={handleCookie} className="hidden md:flex border border-yellow-400 text-yellow-400 px-4 py-2 rounded-lg hover:bg-yellow-400 hover:text-black transition font-semibold">
              Logout
            </button>

            <div className="relative">
              <button onClick={toggleReqModal} className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center hover:bg-[#232323] transition">
                <img src={Request} alt="req" className="w-5 h-5" />
              </button>
              {nfollow > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-black w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center text-xs font-bold">
                  {nfollow}
                </span>
              )}
            </div>

            <div className="relative">
              <Link to={`/chat/${authdata?.userid}`}>
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center hover:bg-[#232323] transition">
                  <img src={chat} alt="chat" className="w-5 h-5" />
                </div>
              </Link>
              {nchat > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-black w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center text-xs font-bold">
                  {nchat}
                </span>
              )}
            </div>

            <button onClick={toggleSidebar} className="md:hidden text-white p-1">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
               </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="h-[68px] md:h-20"></div>

      {/* ✅ MOBILE SIDEBAR */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-[#0f0f0f] text-white transform transition-transform duration-300 z-[60] shadow-2xl border-l border-white/10 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="font-bold text-lg text-yellow-400">Menu</div>
          <button onClick={closeSidebar} className="text-3xl leading-none text-white hover:text-gray-300">
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full ring-2 ring-yellow-400 overflow-hidden mb-3">
              <img src={profile.profilepic || "https://i.pravatar.cc/300"} alt="profile" className="w-full h-full object-cover" />
            </div>
            
            <div className="text-lg font-bold">{profile.username}</div>
            <p className="text-xs text-gray-400 mb-3 line-clamp-2 px-2">{profile.bio}</p>

            <div className="flex items-center gap-6 text-sm mb-4 w-full justify-center bg-[#111] py-2 rounded-lg">
              <div className="flex flex-col">
                <span className="font-bold">{profile.followers}</span>
                <span className="text-[10px] text-gray-400 uppercase">Followers</span>
              </div>
              <div className="w-[1px] h-6 bg-white/10"></div>
              <div className="flex flex-col">
                <span className="font-bold">{profile.following}</span>
                <span className="text-[10px] text-gray-400 uppercase">Following</span>
              </div>
            </div>

            <Link 
               to={`/profile/${authdata?.userid}`} 
               onClick={closeSidebar}
               className="w-full bg-[#252525] hover:bg-[#333] py-2 rounded-lg font-semibold text-sm transition border border-white/5"
            >
              View My Profile
            </Link>
          </div>

          <button
            onClick={() => { togglePostModal(); closeSidebar(); }}
            className="w-full text-center bg-yellow-400 text-black py-3 rounded-lg font-bold hover:opacity-90 transition shadow-lg shadow-yellow-400/10"
          >
            Create New Post
          </button>

          {followback.length > 0 && (
            <div className="mt-2 pt-4 border-t border-white/10">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
                Follow Back
              </h3>
              <div className="flex flex-col gap-3">
                {followback.map((f, idx) => (
                  <div key={idx} className="bg-[#1a1a1a] rounded-lg p-3 border border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden shrink-0">
                         <img src={f.profilepic || "https://i.pravatar.cc/300"} alt="user" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm truncate">{f.username}</div>
                        <div className="text-xs text-yellow-400">Follows you</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="bg-[#333] hover:bg-[#444] text-xs py-2 rounded text-white transition">Remove</button>
                      <button className="bg-yellow-400 hover:opacity-90 text-xs py-2 rounded text-black font-bold transition">Confirm</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleCookie}
            className="mt-auto w-full text-center py-3 rounded-lg font-semibold border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black transition"
          >
            Logout
          </button>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[55] md:hidden backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      <Update showreq={showReqModal} setshowreq={setShowReqModal} reqname={reqname} />
      <Post show={showPostModal} setShow={setShowPostModal} />
    </>
  );
};

export default Shownav;