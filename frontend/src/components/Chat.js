import React, { useContext, useEffect, useState, useRef } from "react";
import ConnectContext from "../context/Connectcontext";
import { IoEllipsisVertical, IoSearch } from "react-icons/io5";
import { FiSend } from "react-icons/fi";
import { Loader2 } from "lucide-react";

const Chat = () => {
  const context = useContext(ConnectContext);
  const {
    userchat, // Function to get list of users you have chatted with
    searchuser, // State containing search results from Api.js
    getchat, // Function to get messages
    chatting, // Function to send message
    authdata,
    // Loading state from context
    chatLoading,
  } = context;

  const [query, setQuery] = useState("");
  const [chatUsers, setChatUsers] = useState([]); // List of sidebar users
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [text, setText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);

  const msgEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ Load initial chat users list (Sidebar)
  useEffect(() => {
    const loadChatUsers = async () => {
      const users = await userchat();
      if (users) setChatUsers(users);
    };
    loadChatUsers();
  }, []);

  // ✅ Search Logic
  // Api.js has 'searchuser' state which is populated by search(). 
  // We can filter that locally or use it directly. 
  // For this example, let's assume searchuser from context is all users.
  const filteredUsers = query.trim() 
    ? searchuser.filter(u => u.username.toLowerCase().includes(query.toLowerCase()))
    : chatUsers;

  const handleUserClick = async (u) => {
    setSelectedUser(u);
    setLoadingMessages(true);
    setMessages([]); // Clear previous chat immediately

    try {
      // getchat returns the chat object which contains 'messages' array
      const chatData = await getchat(u._id);
      if (chatData && chatData.messages) {
        setMessages(chatData.messages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.log("Error loading chat", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSend = async () => {
    if (!text.trim() || !selectedUser) return;

    const msgToSend = text;
    setText(""); // Optimistic clear

    // Optimistic UI update (optional, adds message immediately)
    const optimisticMsg = {
        text: msgToSend,
        sender: authdata.userid, // assuming authdata has userid
        timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    await chatting(selectedUser._id, authdata.authtoken, msgToSend);
    
    // Refresh to get server confirmation/timestamp if needed, or just rely on socket updates
    // For now, we fetch again to be safe
    const updatedChat = await getchat(selectedUser._id);
    if (updatedChat && updatedChat.messages) setMessages(updatedChat.messages);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] -mt-20 pt-28 px-4 md:px-10 pb-6 flex gap-6 text-white h-screen">

      {/* LEFT SIDEBAR */}
      <div className="w-full md:w-[320px] flex flex-col bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/10 h-[80vh] shadow-xl">

        {/* Search Bar */}
        <div className="p-4 bg-[#1a1a1a] border-b border-white/10 shrink-0">
          <div className="relative">
            <IoSearch className="absolute left-3 top-3 text-gray-400 text-xl" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people..."
              className="w-full bg-[#111] rounded-lg pl-10 pr-3 py-2 text-sm text-gray-200 placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
            />
          </div>
        </div>

        {/* USER LIST */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          
          {chatLoading && !selectedUser ? (
             <div className="flex justify-center py-10">
               <Loader2 className="animate-spin text-yellow-400" size={30} />
             </div>
          ) : (
             <>
               {filteredUsers?.length > 0 ? (
                 filteredUsers.map((u, i) => (
                   <div
                     key={u._id || i}
                     className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-all duration-200
                     ${selectedUser?._id === u._id 
                       ? "bg-yellow-400/10 border border-yellow-400/30" 
                       : "hover:bg-white/5 border border-transparent"
                     }`}
                     onClick={() => handleUserClick(u)}
                   >
                     <div className="relative shrink-0">
                        <img
                          src={u.profilepic || "https://i.pravatar.cc/150"} // Fallback image
                          alt=""
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
                        />
                        {/* Online Status Indicator (Optional/Static for now) */}
                        {/* <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1a1a1a]"></span> */}
                     </div>

                     <div className="flex-1 min-w-0">
                       <div className={`text-sm font-semibold truncate ${selectedUser?._id === u._id ? "text-yellow-400" : "text-gray-200"}`}>
                          {u.username}
                       </div>
                       {/* Last message preview could go here if available in user object */}
                       <div className="text-xs text-gray-500 truncate">Click to chat</div>
                     </div>

                     <div className="relative shrink-0">
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           setDropdownOpen(dropdownOpen === u._id ? null : u._id);
                         }}
                         className="text-gray-400 hover:text-white transition p-1 rounded-full hover:bg-white/10"
                       >
                         <IoEllipsisVertical />
                       </button>

                       {/* DROPDOWN MENU */}
                       {dropdownOpen === u._id && (
                         <div className="absolute right-0 top-8 bg-[#111] border border-white/10 rounded-lg shadow-xl w-36 z-50 overflow-hidden">
                           <button className="block w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-sm transition font-medium">
                             Delete chat
                           </button>
                         </div>
                       )}
                     </div>
                   </div>
                 ))
               ) : (
                 <div className="text-center text-gray-500 mt-10 text-sm">
                   {query ? "No users found" : "No recent chats"}
                 </div>
               )}
             </>
          )}
        </div>
      </div>

      {/* CHAT AREA (Right Side) */}
      <div className={`flex-1 bg-[#1a1a1a] rounded-xl border border-white/10 flex flex-col h-[80vh] shadow-xl overflow-hidden ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>

        {selectedUser ? (
          <>
            {/* TOP BAR */}
            <div className="px-6 py-4 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between shrink-0 shadow-sm z-10">
              <div className="flex items-center gap-4">
                 {/* Back button for Mobile (Optional implementation) */}
                 {/* <button className="md:hidden text-gray-400" onClick={() => setSelectedUser(null)}><ArrowLeft /></button> */}
                 
                 <img 
                    src={selectedUser.profilepic || "https://i.pravatar.cc/150"} 
                    className="w-10 h-10 rounded-full bg-gray-700 object-cover" 
                    alt="" 
                 />
                 <div>
                    <div className="text-white font-bold text-lg leading-tight">
                       {selectedUser.username}
                    </div>
                    {/* <div className="text-xs text-green-400">Online</div> */}
                 </div>
              </div>
            </div>

            {/* MESSAGES AREA */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[#0d0d0d]/50 scrollbar-thin scrollbar-thumb-gray-800">
              
              {loadingMessages ? (
                 <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
                    <Loader2 className="animate-spin text-yellow-400" size={32} />
                    <p className="text-sm">Loading conversation...</p>
                 </div>
              ) : (
                <>
                  {messages?.length > 0 ? (
                    messages.map((m, i) => {
                      const isMe = m.sender === authdata.userid || m.self; // Check both depending on API response structure
                      return (
                        <div
                          key={i}
                          className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fadeIn`}
                        >
                          <div
                            className={`max-w-[75%] md:max-w-[60%] px-5 py-3 rounded-2xl text-sm shadow-md break-words
                            ${isMe
                              ? "bg-yellow-400 text-black rounded-tr-none font-medium selection:bg-black/20"
                              : "bg-[#2a2a2a] text-gray-200 rounded-tl-none border border-white/5 selection:bg-yellow-400/30"
                            }`}
                          >
                            {m.text}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
                       <div className="bg-[#222] p-4 rounded-full mb-3">
                          <FiSend size={32} />
                       </div>
                       <p>Say hello to start the conversation!</p>
                    </div>
                  )}
                  <div ref={msgEndRef}></div>
                </>
              )}
            </div>

            {/* INPUT BAR */}
            <div className="p-4 bg-[#1a1a1a] border-t border-white/10 flex items-center gap-3 shrink-0">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-[#111] rounded-full px-5 py-3.5 text-gray-200 border border-white/10
                focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition placeholder:text-gray-500"
              />
              <button
                onClick={handleSend}
                disabled={!text.trim()}
                className={`p-3.5 rounded-full transition shadow-lg flex items-center justify-center
                  ${text.trim() 
                    ? "bg-yellow-400 hover:bg-yellow-300 text-black shadow-yellow-400/20 transform hover:scale-105 active:scale-95" 
                    : "bg-[#333] text-gray-500 cursor-not-allowed"
                  }`}
              >
                <FiSend className="text-xl ml-0.5" /> {/* ml-0.5 to visually center the icon */}
              </button>
            </div>
          </>
        ) : (
          /* EMPTY STATE (No User Selected) */
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-[#1a1a1a]">
            <div className="w-20 h-20 bg-[#222] rounded-full flex items-center justify-center mb-4 animate-pulse">
               <FiSend size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Your Messages</h3>
            <p className="text-sm text-gray-400 max-w-xs text-center">
              Select a chat from the left to start messaging.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Chat;