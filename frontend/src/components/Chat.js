import React, { useContext, useEffect, useState, useRef } from "react";
import Connect_Context from "../context/Connectcontext";
import { IoEllipsisVertical } from "react-icons/io5";
import { FiSend } from "react-icons/fi";
import { IoSearch } from "react-icons/io5";

const Chat = () => {
  const context = useContext(Connect_Context);
  const {
    alluser,
    searchuserchat,
    fetchchat,
    sendmessage,
    getmessages,
  } = context;

  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [text, setText] = useState("");

  const msgEndRef = useRef();

  const scrollToBottom = () => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleUserClick = async (u) => {
    setSelectedUser(u);
    const data = await getmessages(u._id);
    setMessages(data);
  };

  const handleSend = async () => {
    if (!text.trim() || !selectedUser) return;
    await sendmessage(selectedUser._id, text);
    setText("");
    const updated = await getmessages(selectedUser._id);
    setMessages(updated);
  };

  return (
    // ✅ FIXED: Added -mt-20 to hide white gap, pt-24 to push content down correct amount
    // ✅ FIXED: Updated background to #0f0f0f to match other pages
    <div className="min-h-screen bg-[#0f0f0f] -mt-20 pt-28 px-4 md:px-10 pb-6 flex gap-6 text-white">

      {/* LEFT SIDEBAR */}
      <div className="w-[280px] hidden md:flex flex-col bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/10 h-[80vh]">

        {/* Search Bar */}
        <div className="p-4 bg-[#1a1a1a] border-b border-white/10">
          <div className="relative">
            <IoSearch className="absolute left-3 top-3 text-gray-400 text-xl" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                searchuserchat(e.target.value);
              }}
              placeholder="Search chat"
              className="w-full bg-[#111] rounded-lg pl-10 pr-3 py-2 text-sm text-gray-200 placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
            />
          </div>

          {/* Suggestions */}
          {query.length > 0 && (
            <div className="mt-2 bg-[#1c1c1c] border border-white/10 rounded-lg max-h-60 overflow-y-auto">
              {alluser?.length > 0 ? (
                alluser.map((u, i) => (
                  <button
                    key={i}
                    onClick={() => handleUserClick(u)}
                    className="w-full text-left px-3 py-2 hover:bg-white/10 text-gray-200"
                  >
                    {u.username}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-400">No users found</div>
              )}
            </div>
          )}
        </div>

        {/* USER LIST */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-gray-700">
          {alluser?.map((u, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer transition 
              ${selectedUser?._id === u._id ? "bg-yellow-500/20 border border-yellow-500/30" : "hover:bg-white/5 border border-transparent"}`}
              onClick={() => handleUserClick(u)}
            >
              <img
                src={u.profilepic}
                alt=""
                className="w-10 h-10 rounded-full object-cover ring-2 ring-yellow-400/50"
              />
              <div className="flex-1 text-sm font-medium text-gray-200">{u.username}</div>

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(dropdownOpen === i ? null : i);
                  }}
                  className="text-gray-400 hover:text-white transition"
                >
                  <IoEllipsisVertical />
                </button>

                {dropdownOpen === i && (
                  <div className="absolute right-0 mt-2 bg-[#111] border border-white/10 rounded-lg shadow-lg w-36 z-20">
                    <button className="block w-full text-left px-3 py-2 text-red-400 hover:bg-red-500/10 text-sm">
                      Delete chat
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* CHAT AREA */}
      <div className="flex-1 bg-[#1a1a1a] rounded-xl border border-white/10 flex flex-col h-[80vh]">

        {/* TOP BAR */}
        <div className="px-6 py-4 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between rounded-t-xl">
          <div className="text-white font-semibold text-lg flex items-center gap-3">
             {selectedUser && (
                <img src={selectedUser.profilepic} className="w-8 h-8 rounded-full bg-gray-700" alt="" />
             )}
            {selectedUser ? selectedUser.username : "Select a user to chat"}
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {messages?.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.self ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm 
                ${m.self
                  ? "bg-yellow-400 text-black rounded-br-none font-medium"
                  : "bg-[#333] text-gray-200 rounded-bl-none border border-white/5"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          <div ref={msgEndRef}></div>
        </div>

        {/* INPUT BAR */}
        {selectedUser && (
          <div className="p-4 bg-[#1a1a1a] border-t border-white/10 flex items-center gap-3 rounded-b-xl">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-[#111] rounded-full px-5 py-3 text-gray-200 border border-white/10
              focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
            />
            <button
              onClick={handleSend}
              className="bg-yellow-400 hover:bg-yellow-300 text-black p-3 rounded-full transition shadow-lg shadow-yellow-400/20"
            >
              <FiSend className="text-xl" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Chat;