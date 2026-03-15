import React, { useContext, useEffect, useRef, useState, useCallback } from "react";
import ConnectContext from "../context/Connectcontext";
import { useParams, useNavigate } from "react-router-dom"; 
import { FiSend } from "react-icons/fi"; 
import { Heart, Loader2 } from "lucide-react"; 

import commentss from "../assets/comment.svg";

const Userprofile = () => {
  const { userid } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    username: "",
    profilepic: "",
    followers: [],
    following: [],
    bio: "",
    skills: [],
  });

  const [posts, setPosts] = useState([]);
  const [com, setCom] = useState([]);
  const [comusers, setComUsers] = useState({ usernames: [] });
  const [replyusers, setReplyUsers] = useState({ usernames: [] });
  const [visible, setVisible] = useState(null);
  const [replies, setReplies] = useState([]);
  const [activePostId, setActivePostId] = useState(null);

  const [replytext, setReplyText] = useState({ text: "" });
  const [comtext, setComText] = useState({ text: "" });

  const [postMessage, setPostMessage] = useState("No Posts Found");
  const [fstatus, setFstatus] = useState("Follow");
  
  const [isFetchingComments, setIsFetchingComments] = useState(false);
  const [isFetchingReplies, setIsFetchingReplies] = useState(false);

  // ✅ Animation state
  const [likeAnimation, setLikeAnimation] = useState(null);

  const context = useContext(ConnectContext);
  const {
    authdata,
    idtouser,
    likepost,
    dislikepost,
    getcom,
    getreply,
    postreply,
    postcom,
    followpost,
    frequest,
    reqstatus,
    unfuser,
  } = context;

  const inputRef = useRef(null);

  useEffect(() => {
    setPosts([]);
    setCom([]);
    setActivePostId(null);
    setVisible(null);
  }, [userid]);

  const handleClear = () => {
    if (inputRef.current) inputRef.current.value = "";
  };

  const loadUserInfo = useCallback(async () => {
    try {
      const response = await fetch(
        `https://connectify-aml7.onrender.com/api/auth/userinfo/${userid}`,
        { method: "GET", credentials: "include" }
      );
      const json = await response.json();
      if (json.error) return;
      setProfile({
        username: json.username,
        profilepic: json.profilepic,
        followers: json.followers,
        following: json.following,
        bio: json.bio || "No bio available",
        skills: json.skills || [],
      });
    } catch (error) {
      console.log(error);
    }
  }, [userid]);

  const loadUserPosts = useCallback(async () => {
    if (fstatus !== "Following") {
      setPostMessage("Follow this user to see their posts");
      setPosts([]);
      return;
    }
    const fetched = await followpost(profile.username);
    if (fetched.message) setPostMessage(fetched.message);
    else setPosts(fetched);
  }, [fstatus, profile.username, followpost]);

  const handleLike = async (post, isLiked) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p._id === post._id) {
          const updatedLikes = isLiked
            ? p.likes.filter((id) => String(id) !== String(authdata?.userid))
            : [...p.likes, authdata?.userid];
          return { ...p, likes: updatedLikes };
        }
        return p;
      })
    );

    try {
      if (isLiked) {
        await dislikepost(post._id, authdata.authtoken);
      } else {
        await likepost(post._id, authdata.authtoken);
      }
    } catch (error) {
      console.error("handleLike error — rolling back:", error);
      setPosts(prev => prev.map(p => {
        if (p._id === post._id) {
          const rolledBack = isLiked
            ? [...p.likes, authdata?.userid]
            : p.likes.filter(id => String(id) !== String(authdata?.userid));
          return { ...p, likes: rolledBack };
        }
        return p;
      }));
    }
  };

  // ✅ New Double Tap Handler
  const handleDoubleTap = (post, isLiked) => {
    setLikeAnimation(post._id);
    setTimeout(() => setLikeAnimation(null), 1000);
    
    // Only like, never unlike on double-tap
    if (!isLiked) {
      handleLike(post, isLiked);
    }
  };

  const handleCommentClick = async (postId) => {
    if (activePostId === postId) {
      setActivePostId(null);
      setCom([]);
      setComUsers({ usernames: [] });
      return;
    }
    // ✅ Clear + loading before opening — spinner on first render, no flash
    setCom([]);
    setComUsers({ usernames: [] });
    setIsFetchingComments(true);
    setActivePostId(postId);

    try {
      const compost = await getcom(postId, authdata.authtoken);
      if (Array.isArray(compost) && compost.length > 0) {
        const usernames = await idtouser(compost.map(c => c.userid));
        setComUsers(usernames);
        setCom(compost);
      }
    } catch (err) { console.error(err); }
    finally { setIsFetchingComments(false); }
  };

  const handleReplyClick = async (comment_id) => {
    if (visible === comment_id) return setVisible(null);
    // ✅ Clear stale + loading before opening replies — no flash of old data
    setReplies([]);
    setReplyUsers({ usernames: [] });
    setIsFetchingReplies(true);
    setVisible(comment_id);

    try {
      const replydata = await getreply(comment_id, authdata.authtoken);
      if (Array.isArray(replydata) && replydata.length > 0) {
        const usernames = await idtouser(replydata.map(r => r.userid));
        setReplyUsers(usernames);
        setReplies(replydata);
      }
    } catch (err) { console.error(err); }
    finally { setIsFetchingReplies(false); }
  };

  const SubmitReply = async (comment_id) => {
    if (!replytext.text.trim()) return;
    const textToSend = replytext.text;

    // ✅ OPTIMISTIC: append reply instantly
    const optimisticReply = { _id: `temp_${Date.now()}`, userid: authdata.userid, text: textToSend };
    setReplies(prev => [...prev, optimisticReply]);
    setReplyUsers(prev => ({ usernames: [...(prev.usernames || []), 'You'] }));
    setVisible(comment_id);
    setReplyText({ text: "" });
    handleClear();

    try {
      await postreply(comment_id, authdata.authtoken, textToSend);
      // Silently replace temp with real DB data
      const replydata = await getreply(comment_id, authdata.authtoken);
      if (Array.isArray(replydata) && replydata.length > 0) {
        const usernames = await idtouser(replydata.map(r => r.userid));
        setReplyUsers(usernames);
        setReplies(replydata);
      }
    } catch (err) { console.error("SubmitReply error:", err); }
  };

  const SubmitComment = async (postId) => {
    if (!comtext.text.trim()) return;
    const textToSend = comtext.text;

    // ✅ OPTIMISTIC: show comment instantly, increment count on card
    const optimisticComment = { _id: `temp_${Date.now()}`, userid: authdata.userid, text: textToSend };
    setCom(prev => [...prev, optimisticComment]);
    setComUsers(prev => ({ usernames: [...(prev.usernames || []), 'You'] }));
    setPosts(prev => prev.map(p =>
      p._id === postId ? { ...p, comments: [...(p.comments || []), optimisticComment] } : p
    ));
    setComText({ text: "" });
    handleClear();

    try {
      await postcom(postId, authdata.authtoken, textToSend);
      // Silently sync real data from DB
      const allcom = await getcom(postId, authdata.authtoken);
      if (Array.isArray(allcom) && allcom.length > 0) {
        const usernames = await idtouser(allcom.map(c => c.userid));
        setCom(allcom);
        setComUsers(usernames);
      }
    } catch (err) { console.error("SubmitComment error:", err); }
  };

  const loadFollowStatus = useCallback(async () => {
    const data = await reqstatus(userid);
    if (data.message) setFstatus("Follow");
    else {
      const stat = data.followRequests[0].status;
      if (stat === "pending") setFstatus("Requested");
      else if (stat === "accepted") setFstatus("Following");
      else setFstatus("Follow");
    }
  }, [userid, reqstatus]);

  const handleFollowRequest = async () => {
    if (fstatus === "Following") {
      await unfuser(userid);
      setFstatus("Follow");
      setPosts([]);
      return;
    }
    const r = await frequest(profile.username);
    if (!r.message) setFstatus("Requested");
  };

  const handleMessageClick = () => {
    navigate(`/chat/${authdata?.userid}`, {
      state: {
        chatUser: {
          _id: userid,
          username: profile.username,
          profilepic: profile.profilepic,
        },
      },
    });
  };

  useEffect(() => { loadUserInfo(); }, [userid, loadUserInfo]);
  useEffect(() => { loadFollowStatus(); }, [userid, loadFollowStatus]);
  useEffect(() => {
    if (profile.username) loadUserPosts();
  }, [profile.username, fstatus, loadUserPosts]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] -mt-20 pt-20 px-4 md:px-10 pb-10 text-white">
      
      {/* CSS for heart animation */}
      <style>
        {`
          @keyframes popIn {
            0% { transform: scale(0.5); opacity: 0; }
            25% { transform: scale(1.3); opacity: 1; }
            75% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1); opacity: 0; }
          }
        `}
      </style>

      <div className="grid grid-cols-12 gap-6 max-w-[1600px] mx-auto">

        {/* ── LEFT PROFILE CARD ─────────────────────────────────── */}
        <div className="col-span-12 md:col-span-3">
          <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/10 sticky top-24">
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-yellow-400">
                <img
                  src={profile.profilepic || "https://i.pravatar.cc/300"}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mt-4 text-2xl font-semibold">{profile.username}</div>
              <div className="text-gray-400 text-sm mt-1">{profile.bio}</div>

              <div className="flex gap-3 mt-4 w-full">
                <button
                  className={`flex-1 py-2 rounded-full font-semibold transition ${
                    fstatus === "Following"
                      ? "bg-gray-700 border border-white/20 text-white"
                      : "bg-yellow-400 text-black hover:bg-yellow-300"
                  }`}
                  onClick={handleFollowRequest}
                >
                  {fstatus}
                </button>

                <button
                  onClick={handleMessageClick}
                  className="py-2 px-4 rounded-full bg-[#333] hover:bg-[#444] border border-white/10 transition flex items-center gap-2 text-sm font-semibold"
                >
                  <FiSend size={14} />
                  Message
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 text-center">
              <div>
                <div className="text-xl font-bold">{posts.length}</div>
                <div className="text-xs text-gray-400">Posts</div>
              </div>
              <div>
                <div className="text-xl font-bold">{profile.followers?.length || 0}</div>
                <div className="text-xs text-gray-400">Followers</div>
              </div>
              <div>
                <div className="text-xl font-bold">{profile.following?.length || 0}</div>
                <div className="text-xs text-gray-400">Following</div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-lg font-semibold mb-2">Skills</div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.length > 0 ? (
                  profile.skills.map((s, i) => (
                    <span
                      key={i}
                      className="bg-[#262626] px-3 py-1 rounded-md text-sm border border-white/5"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">No skills added</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── CENTER POSTS ──────────────────────────────────────── */}
        <div className="col-span-12 md:col-span-6">
          <h1 className="text-2xl mb-4 font-semibold">{profile.username}'s Posts</h1>

          {fstatus !== "Following" ? (
            <div className="bg-[#1a1a1a] p-8 text-center rounded-2xl text-gray-400 border border-white/10">
              Follow {profile.username} to see their posts
            </div>
          ) : posts.length > 0 ? (
            posts.map((post, index) => {
              const isLiked = post.likes?.some((id) => String(id) === String(authdata?.userid));

              return (
                <div key={index} className="bg-[#1a1a1a] rounded-2xl p-4 mb-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-yellow-400">
                      <img
                        src={profile.profilepic || "https://i.pravatar.cc/300"}
                        alt="profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-lg font-semibold">{profile.username}</div>
                  </div>

                  <div className="font-semibold mb-2 text-gray-200">{post.description}</div>

                  <div 
                    className="relative w-full rounded-xl overflow-hidden bg-black cursor-pointer"
                    onDoubleClick={() => handleDoubleTap(post, isLiked)} // ✅ Replaced inline logic
                  >
                    {post.image ? (
                      <>
                        <img
                          src={post.image}
                          className="w-full object-cover max-h-[66vh] border border-black/40 select-none"
                          alt=""
                        />
                        {/* ✅ Animated Heart Overlay */}
                        {likeAnimation === post._id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10 pointer-events-none">
                            <Heart 
                              className="text-white fill-white drop-shadow-2xl"
                              style={{
                                width: '120px', 
                                height: '120px',
                                animation: 'popIn 0.8s ease-out forwards'
                              }} 
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-gray-400 py-10 text-center bg-black/20">No Image</div>
                    )}
                  </div>

                  <div className="flex items-center mt-3 gap-6">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleLike(post, isLiked)}
                        className="transition transform active:scale-75"
                      >
                        <Heart 
                          className={`w-6 h-6 transition-colors duration-200 ${
                            isLiked 
                              ? "fill-yellow-400 text-yellow-400" 
                              : "text-white hover:text-gray-300"
                          }`} 
                        />
                      </button>
                      <div className="font-semibold">{post.likes?.length || 0}</div>
                    </div>
                    
                    <button 
                      className="flex items-center gap-2 transition hover:opacity-80 text-sm"
                      onClick={() => handleCommentClick(post._id)}
                    >
                      <img src={commentss} alt="" className="w-6 h-6" />
                      <span className="font-semibold">{post.comments?.length || 0}</span>
                    </button>
                  </div>

                  {activePostId === post._id && (
                    <div className="mt-4 flex gap-2">
                      <input
                        placeholder="Write a comment..."
                        onChange={(e) => setComText({ text: e.target.value })}
                        className="flex-1 bg-[#111] px-4 py-2 rounded-full border border-white/10 focus:outline-none focus:border-yellow-400"
                      />
                      <button
                        onClick={() => SubmitComment(post._id)}
                        className="bg-yellow-400 text-black px-4 py-2 rounded-full font-semibold hover:opacity-90"
                      >
                        Send
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-[#1a1a1a] p-8 text-center rounded-2xl text-gray-400 border border-white/10">
              {postMessage}
            </div>
          )}
        </div>

        {/* ── RIGHT COMMENT PANEL ───────────────────────────────── */}
        {fstatus === "Following" && (
          <div className="col-span-12 md:col-span-3">
            <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/10 sticky top-24 h-fit">
              {!activePostId ? (
                <div className="text-gray-400 text-center">
                  Select a post to view comments
                </div>
              ) : (
                <>
                  <div className="text-lg font-semibold mb-3 text-gray-300">
                    Comments on {profile.username}'s post
                  </div>

                  {isFetchingComments ? (
                    <div className="flex justify-center py-6"><Loader2 className="animate-spin text-yellow-400" size={24} /></div>
                  ) : com.length > 0 ? (
                    com.map((comment, idx) => (
                      <div key={idx} className="bg-[#111] p-3 mb-3 rounded-xl border border-white/5">
                        <div className="font-semibold text-gray-200">
                          {comusers.usernames[idx]}
                        </div>
                        <div className="text-gray-400 mt-1 text-sm">{comment.text}</div>

                        <button
                          className="mt-2 text-yellow-400 text-xs font-medium"
                          onClick={() => handleReplyClick(comment._id)}
                        >
                          {visible === comment._id ? "Hide replies" : "Show replies"}
                        </button>

                        {visible === comment._id && (
                          <div className="mt-3 border-l-2 border-yellow-400 pl-3">
                            {isFetchingReplies
                              ? <div className="flex items-center gap-1 py-1"><Loader2 className="animate-spin text-yellow-400" size={12} /><span className="text-xs text-gray-500">Loading replies...</span></div>
                              : replies.length > 0
                                ? replies.map((reply, i) => (
                                    <p key={i} className="text-gray-300 text-sm mb-1">
                                      <b className="text-gray-100">{replyusers.usernames[i]}</b>:{" "}
                                      {reply.text}
                                    </p>
                                  ))
                                : <p className="text-gray-500 text-xs">No replies yet</p>
                            }
                          </div>
                        )}

                        <div className="mt-3 flex gap-2">
                          <input
                            ref={inputRef}
                            placeholder="Reply..."
                            className="bg-[#000] px-3 py-2 flex-1 rounded-lg border border-white/10 text-sm focus:outline-none focus:border-yellow-400"
                            onChange={(e) => setReplyText({ text: e.target.value })}
                          />
                          <button
                            className="bg-yellow-400 px-3 py-1 rounded-lg text-black text-sm font-semibold"
                            onClick={() => SubmitReply(comment._id)}
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-sm">No comments yet</div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Userprofile;