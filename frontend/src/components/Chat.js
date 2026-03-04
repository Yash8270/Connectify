import React, { useContext, useEffect, useState, useRef, useCallback } from "react";
import ConnectContext from "../context/Connectcontext";
import { IoEllipsisVertical, IoSearch, IoMenu } from "react-icons/io5";
import { FiSend } from "react-icons/fi";
import { Loader2 } from "lucide-react";
import { useLocation } from "react-router-dom";

const formatTimeAgo = (dateString) => {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${Math.floor(diffInHours / 24)}d ago`;
};

const formatMessageTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDateSeparator = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  
  const isToday = date.getDate() === now.getDate() && 
                  date.getMonth() === now.getMonth() && 
                  date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.getDate() === yesterday.getDate() && 
                      date.getMonth() === yesterday.getMonth() && 
                      date.getFullYear() === yesterday.getFullYear();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'long' }); 
  }
  return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }); 
};

const sid = (v) => (v ? v.toString().trim() : "");

const Chat = () => {
  const location = useLocation();
  const context = useContext(ConnectContext);
  const {
    userchat,
    searchuser,
    getchat,
    chatting,
    firstchat,
    delchat,
    seenstatus,
    notification,
    authdata,
    chatLoading,
    socket,
  } = context;

  const [query, setQuery] = useState("");
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [text, setText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatExists, setChatExists] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});

  const msgEndRef = useRef(null);
  const didAutoSelect = useRef(false);
  const typingTimeoutRef = useRef(null);

  const selectedUserRef = useRef(null);
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  const authdataRef = useRef(authdata);
  useEffect(() => {
    authdataRef.current = authdata;
  }, [authdata]);

  // Moved markSeen UP so handleUserClick can use it as a dependency
  const markSeen = useCallback(async (userId) => {
    try {
      await seenstatus(userId, new Date().toISOString());
      await notification(); 
      socket?.emit("seen", {
        userid: sid(authdata?.userid),
        receiverid: sid(userId),
        seen: true,
      });
    } catch (err) {
      console.error("markSeen error:", err);
    }
  }, [seenstatus, notification, socket, authdata?.userid]);

  // Wrapped handleUserClick in useCallback
  const handleUserClick = useCallback(async (u) => {
    const userId = u._id || u.userid;
    setSelectedUser({ ...u, _id: userId });
    setDropdownOpen(null);
    setLoadingMessages(true);
    setMessages([]);
    setChatExists(false);

    setChatUsers(prev => prev.map(user => 
      sid(user.userid || user._id) === sid(userId) ? { ...user, hasUnseen: false } : user
    ));

    try {
      const chatData = await getchat(userId);
      if (chatData && chatData.messages && chatData.messages.length > 0) {
        setMessages(chatData.messages);
        setChatExists(true);
        markSeen(userId);
      } else {
        setMessages([]);
        setChatExists(false);
      }
    } catch (error) {
      console.log("Error loading chat", error);
    } finally {
      setLoadingMessages(false);
    }
  }, [getchat, markSeen]);
  
  const scrollToBottom = () => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [messages]);

  const loadChatUsers = useCallback(async () => {
    const users = await userchat();
    if (Array.isArray(users)) setChatUsers(users);
  }, [userchat]);

  useEffect(() => { loadChatUsers(); }, [loadChatUsers]);

  useEffect(() => {
    if (didAutoSelect.current) return;
    const incoming = location.state?.chatUser;
    if (!incoming) return;
    didAutoSelect.current = true;
    const t = setTimeout(() => handleUserClick(incoming), 400);
    return () => clearTimeout(t);
  }, [location.state, handleUserClick]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      const currentUser = selectedUserRef.current;
      const myId = sid(authdataRef.current?.userid);
      const senderId = sid(data.sender);

      if (currentUser && sid(currentUser._id) === senderId) {
        setMessages((prev) => [
          ...prev,
          {
            sender: data.sender,
            text: data.text,
            timestamp: new Date().toISOString(),
            seen: { status: true, duration: new Date().toISOString() }, 
          },
        ]);
        
        seenstatus(sid(currentUser._id), new Date().toISOString()).then(() => {
          notification(); 
        });

        socket.emit("seen", {
          userid: myId,
          receiverid: senderId,
          seen: true,
        });
      } else {
        setChatUsers(prev => {
          const userIndex = prev.findIndex(u => sid(u.userid || u._id) === senderId);
          if (userIndex !== -1) {
            const updatedUser = { ...prev[userIndex], hasUnseen: true };
            const newArr = [...prev];
            newArr.splice(userIndex, 1);
            return [updatedUser, ...newArr];
          }
          return prev; 
        });
        notification();
      }

      setTypingUsers((prev) => ({ ...prev, [senderId]: false }));
    };

    const handleTypingStatus = (data) => {
      setTypingUsers((prev) => ({
        ...prev,
        [sid(data.userid)]: data.TypingStatus,
      }));
    };

    const handleSeenStatus = (data) => {
      const currentUser = selectedUserRef.current;
      const myId = sid(authdataRef.current?.userid);
      if (currentUser && sid(currentUser._id) === sid(data.userid) && data.seen) {
        setMessages((prev) =>
          prev.map((m) =>
            sid(m.sender) === myId 
            ? { ...m, seen: { status: true, duration: new Date().toISOString() } } 
            : m
          )
        );
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("TypingStatus", handleTypingStatus);
    socket.on("seen_status", handleSeenStatus);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("TypingStatus", handleTypingStatus);
      socket.off("seen_status", handleSeenStatus);
    };
  // Added notification and seenstatus to dependencies
  }, [socket, notification, seenstatus]); 

  const handleTyping = (e) => {
    setText(e.target.value);
    if (!socket || !selectedUserRef.current) return;

    const recId = sid(selectedUserRef.current._id || selectedUserRef.current.userid);

    socket.emit("Typing", {
      userid: sid(authdata?.userid),
      receiverid: recId,
      TypingStatus: true,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("Typing", {
        userid: sid(authdata?.userid),
        receiverid: recId,
        TypingStatus: false,
      });
    }, 2000);
  };

  const handleSend = async () => {
    if (!text.trim() || !selectedUser || sendingMessage) return;

    const msgToSend = text;
    setText("");
    setSendingMessage(true);

    if (socket) {
      socket.emit("Typing", {
        userid: sid(authdata?.userid),
        receiverid: sid(selectedUser._id || selectedUser.userid),
        TypingStatus: false,
      });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }

    const optimisticMsg = {
      text: msgToSend,
      sender: authdata.userid,
      timestamp: new Date().toISOString(),
      seen: { status: false },
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      let updatedChat;

      if (!chatExists) {
        updatedChat = await firstchat(selectedUser._id, msgToSend);
        if (updatedChat && updatedChat.messages) {
          setChatExists(true);
          setMessages(updatedChat.messages);
          setChatUsers((prev) => {
            const alreadyThere = prev.some(
              (u) => sid(u.userid || u._id) === sid(selectedUser._id)
            );
            if (!alreadyThere) {
              return [
                {
                  userid: selectedUser._id,
                  profilepic: selectedUser.profilepic,
                  username: selectedUser.username,
                  hasUnseen: false
                },
                ...prev,
              ];
            }
            return prev;
          });
        } else {
          const errMsg = updatedChat?.message || "Could not send message. Make sure you follow this user first.";
          alert(errMsg);
          setMessages((prev) => prev.filter((m) => m !== optimisticMsg));
          setSendingMessage(false);
          return;
        }
      } else {
        updatedChat = await chatting(selectedUser._id, authdata.authtoken, msgToSend);
        if (updatedChat && updatedChat.messages) {
          setMessages(updatedChat.messages);
        }
      }

      socket?.emit("privateMessage", {
        recipientId: sid(selectedUser._id || selectedUser.userid),
        message: msgToSend,
        senderId: sid(authdata?.userid),
      });

    } catch (err) {
      console.log("Send error:", err);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteChat = async (e, u) => {
    e.stopPropagation();
    const userId = u._id || u.userid;
    await delchat(userId);
    setChatUsers((prev) =>
      prev.filter((c) => sid(c.userid || c._id) !== sid(userId))
    );
    if (sid(selectedUser?._id) === sid(userId)) {
      setSelectedUser(null);
      setMessages([]);
      setChatExists(false);
    }
    setDropdownOpen(null);
    notification(); 
  };

  const filteredUsers = query.trim()
    ? searchuser
        .filter((u) => u.username?.toLowerCase().includes(query.toLowerCase()))
        .map((u) => ({ ...u, _id: u._id, isSearchResult: true }))
    : chatUsers.map((u) => ({ ...u, _id: u.userid }));

  const isSelectedUserTyping = selectedUser 
    ? typingUsers[sid(selectedUser._id || selectedUser.userid)] 
    : false;

  return (
    <div className="min-h-screen bg-[#0f0f0f] -mt-20 pt-28 px-4 md:px-10 pb-6 flex gap-6 text-white h-screen">

      {/* ── LEFT SIDEBAR ─────────────────────────────────────── */}
      <div className={`w-full md:w-[320px] flex-col bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/10 h-[80vh] shadow-xl ${selectedUser ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 bg-[#1a1a1a] border-b border-white/10 shrink-0">
          
          <div className="flex items-center gap-3 mb-4">
            <img
              src={authdata?.profilepic || "https://i.pravatar.cc/150"}
              alt="My Profile"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
            />
            <div>
              <div className="text-sm font-bold text-white truncate">
                {authdata?.username || "My Profile"}
              </div>
              {/* <div className="text-xs text-green-400 font-medium">Online</div> */}
            </div>
          </div>

          <div className="relative">
            <IoSearch className="absolute left-3 top-3 text-gray-400 text-xl" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people to chat..."
              className="w-full bg-[#111] rounded-lg pl-10 pr-3 py-2 text-sm text-gray-200 placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
            />
          </div>
          {query && (
            <p className="text-xs text-gray-500 mt-2 px-1">
              Showing all users — click to start a new chat
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          {chatLoading && chatUsers.length === 0 ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-yellow-400" size={30} />
            </div>
          ) : (
            <>
              {filteredUsers?.length > 0 ? (
                filteredUsers.map((u, i) => {
                  const userId = u._id || u.userid;
                  const isSelected = sid(selectedUser?._id) === sid(userId);
                  const isUserTyping = typingUsers[sid(userId)];
                  const hasUnseen = u.hasUnseen === true;

                  return (
                    <div
                      key={sid(userId) || i}
                      className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-all duration-200
                      ${isSelected
                        ? "bg-yellow-400/10 border border-yellow-400/30"
                        : "hover:bg-white/5 border border-transparent"
                      }`}
                      onClick={() => handleUserClick(u)}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={u.profilepic || "https://i.pravatar.cc/150"}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className={`text-sm truncate ${
                          hasUnseen ? "text-white font-extrabold" 
                          : isSelected ? "text-yellow-400 font-bold" 
                          : "text-gray-200 font-medium"
                        }`}>
                          {u.username || "Unknown User"}
                        </div>
                        <div className={`text-xs truncate ${hasUnseen && !isUserTyping ? "text-blue-400 font-bold" : "text-gray-500"}`}>
                          {isUserTyping ? (
                            <span className="text-yellow-400 font-medium animate-pulse">Typing...</span>
                          ) : hasUnseen ? (
                            "New message"
                          ) : u.isSearchResult ? (
                            "Click to start chat"
                          ) : (
                            "Click to open chat"
                          )}
                        </div>
                      </div>

                      {hasUnseen && (
                         <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.8)] mr-1"></div>
                      )}

                      {!u.isSearchResult && (
                        <div className="relative shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDropdownOpen(sid(userId) === dropdownOpen ? null : sid(userId));
                            }}
                            className="text-gray-400 hover:text-white transition p-1 rounded-full hover:bg-white/10"
                          >
                            <IoEllipsisVertical />
                          </button>
                          {dropdownOpen === sid(userId) && (
                            <div className="absolute right-0 top-8 bg-[#111] border border-white/10 rounded-lg shadow-xl w-36 z-50 overflow-hidden">
                              <button
                                onClick={(e) => handleDeleteChat(e, u)}
                                className="block w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-sm transition font-medium"
                              >
                                Delete chat
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-500 mt-10 text-sm px-4">
                  {query ? "No users found" : "No recent chats. Search for a user above to start a conversation!"}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── CHAT AREA ────────────────────────────────────────── */}
      <div
        className={`flex-1 bg-[#1a1a1a] rounded-xl border border-white/10 flex flex-col h-[80vh] shadow-xl overflow-hidden ${
          !selectedUser ? "hidden md:flex" : "flex"
        }`}
      >
        {selectedUser ? (
          <>
            <div className="px-4 md:px-6 py-4 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between shrink-0 shadow-sm z-10">
              <div className="flex items-center gap-3 md:gap-4">
                {/* ── MOBILE MENU BUTTON TO VIEW ALL CHATS ── */}
                <button
                  className="md:hidden text-gray-400 hover:text-yellow-400 transition p-1 -ml-1"
                  onClick={() => setSelectedUser(null)}
                  title="View all chats"
                >
                  <IoMenu size={26} />
                </button>

                <img
                  src={selectedUser.profilepic || "https://i.pravatar.cc/150"}
                  className="w-10 h-10 rounded-full bg-gray-700 object-cover"
                  alt=""
                />
                <div>
                  <div className="text-white font-bold text-lg leading-tight">
                    {selectedUser.username || "Unknown User"}
                  </div>

                  {isSelectedUserTyping ? (
                    <div className="text-xs text-yellow-400 font-medium mt-0.5 flex items-center gap-1.5">
                      <span className="flex gap-0.5">
                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce [animation-delay:300ms]" />
                      </span>
                      typing...
                    </div>
                  ) : (
                    !chatExists && !loadingMessages && (
                      <div className="text-xs text-yellow-400/70 mt-0.5">New conversation</div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0d0d0d]/50 scrollbar-thin scrollbar-thumb-gray-800">
              {loadingMessages ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
                  <Loader2 className="animate-spin text-yellow-400" size={32} />
                  <p className="text-sm">Loading conversation...</p>
                </div>
              ) : (
                <>
                  {messages?.length > 0 ? (
                    messages.map((m, i) => {
                      const isMe = sid(m.sender) === sid(authdata?.userid) || m.self === true;
                      const isSeen = m.seen?.status === true;

                      const currentMessageDate = new Date(m.timestamp).toDateString();
                      const previousMessageDate = i > 0 ? new Date(messages[i - 1].timestamp).toDateString() : null;
                      const showDateSeparator = currentMessageDate !== previousMessageDate;

                      return (
                        <React.Fragment key={m._id || i}>
                          {showDateSeparator && (
                            <div className="flex justify-center my-6">
                              <span className="bg-[#2a2a2a] text-gray-400 text-[11px] uppercase tracking-wider px-3 py-1 rounded-full font-medium shadow-sm border border-white/5">
                                {formatDateSeparator(m.timestamp)}
                              </span>
                            </div>
                          )}

                          <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} mb-3`}>
                            <div
                              className={`max-w-[75%] md:max-w-[60%] px-5 py-3 rounded-2xl text-sm shadow-md break-words
                              ${isMe
                                ? "bg-yellow-400 text-black rounded-tr-none font-medium"
                                : "bg-[#2a2a2a] text-gray-200 rounded-tl-none border border-white/5"
                              }`}
                            >
                              {m.text}
                            </div>

                            <div className={`text-[10px] mt-1 flex items-center gap-1 font-medium ${isMe ? "pr-1" : "text-gray-500 pl-1"}`}>
                              {!isMe ? (
                                <span>{formatMessageTime(m.timestamp)}</span>
                              ) : (
                                <span className={isSeen ? "text-blue-400" : "text-gray-500"}>
                                  {isSeen 
                                    ? `✓✓ Seen ${formatTimeAgo(m.seen?.duration || m.timestamp)}` 
                                    : `✓ Sent ${formatTimeAgo(m.timestamp)}`
                                  }
                                </span>
                              )}
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
                      <div className="bg-[#222] p-4 rounded-full mb-3">
                        <FiSend size={32} />
                      </div>
                      <p>Say hello to start the conversation!</p>
                      {!chatExists && (
                        <p className="text-xs mt-2 text-yellow-400/60">
                          (You must follow this user to send a message)
                        </p>
                      )}
                    </div>
                  )}
                  <div ref={msgEndRef} />
                </>
              )}
            </div>

            <div className="p-4 bg-[#1a1a1a] border-t border-white/10 flex items-center gap-3 shrink-0">
              <input
                value={text}
                onChange={handleTyping}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-[#111] rounded-full px-5 py-3.5 text-gray-200 border border-white/10
                focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition placeholder:text-gray-500"
              />
              <button
                onClick={handleSend}
                disabled={!text.trim() || sendingMessage}
                className={`p-3.5 rounded-full transition shadow-lg flex items-center justify-center
                  ${text.trim() && !sendingMessage
                    ? "bg-yellow-400 hover:bg-yellow-300 text-black shadow-yellow-400/20 transform hover:scale-105 active:scale-95"
                    : "bg-[#333] text-gray-500 cursor-not-allowed"
                  }`}
              >
                {sendingMessage
                  ? <Loader2 className="animate-spin text-current" size={20} />
                  : <FiSend className="text-xl ml-0.5" />
                }
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-[#1a1a1a]">
            <div className="w-20 h-20 bg-[#222] rounded-full flex items-center justify-center mb-4 animate-pulse">
              <FiSend size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Your Messages</h3>
            <p className="text-sm text-gray-400 max-w-xs text-center">
              Select a recent chat or search for a user to start messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;