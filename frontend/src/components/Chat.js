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
    <div className="min-h-screen pt-[11vh] bg-[#151515] px-4 md:px-10 pb-6 flex gap-6">

      {/* LEFT SIDEBAR */}
      <div className="w-[280px] hidden md:flex flex-col bg-[#222] rounded-xl shadow-xl overflow-hidden border border-white/5">

        {/* Search Bar */}
        <div className="p-4 bg-[#252525] border-b border-white/5">
          <div className="relative">
            <IoSearch className="absolute left-3 top-3 text-gray-400 text-xl" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                searchuserchat(e.target.value);
              }}
              placeholder="Search chat"
              className="w-full bg-[#333] rounded-lg pl-10 pr-3 py-2 text-sm text-gray-200 placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {alluser?.map((u, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer transition 
              ${selectedUser?._id === u._id ? "bg-yellow-500/20" : "hover:bg-white/10"}`}
              onClick={() => handleUserClick(u)}
            >
              <img
                src={u.profilepic}
                alt=""
                className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400"
              />
              <div className="flex-1 text-white">{u.username}</div>

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(dropdownOpen === i ? null : i);
                  }}
                  className="text-gray-300 text-xl"
                >
                  <IoEllipsisVertical />
                </button>

                {dropdownOpen === i && (
                  <div className="absolute right-0 mt-2 bg-[#111] border border-white/10 rounded-lg shadow-lg w-36 z-20">
                    <button className="block w-full text-left px-3 py-2 text-gray-200 hover:bg-yellow-500/20">
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
      <div className="flex-1 bg-[#1a1a1a] rounded-xl border border-white/5 shadow-xl flex flex-col">

        {/* TOP BAR */}
        <div className="px-5 py-4 bg-[#222] border-b border-white/10 flex items-center justify-between">
          <div className="text-white font-semibold text-lg">
            {selectedUser ? selectedUser.username : "Select a user"}
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {messages?.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.self ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-lg text-sm 
                ${m.self
                  ? "bg-yellow-400 text-black rounded-br-none"
                  : "bg-[#333] text-gray-200 rounded-bl-none"
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
          <div className="p-4 bg-[#222] border-t border-white/10 flex items-center gap-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-[#333] rounded-lg px-4 py-2 text-gray-200 border border-white/10
              focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button
              onClick={handleSend}
              className="bg-yellow-400 hover:bg-yellow-300 text-black p-3 rounded-lg transition"
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
