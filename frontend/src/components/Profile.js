import React, { useContext, useEffect, useRef, useState } from "react";
import ConnectContext from "../context/Connectcontext";
import Cookies from "js-cookie";
import commentss from "../assets/comment.svg";
import { Heart, Loader2 } from "lucide-react";

const Profile = () => {
  const [profile, setprofile] = useState({
    username: "",
    profilepic: "",
    followers: 0,
    following: 0,
    bio: "",
    skills: [],
  });

  const [posts, setposts] = useState([]);
  const [com, setcom] = useState([]);
  const [comusers, setcomusers] = useState({ usernames: [] });
  const [replyusers, setreplyusers] = useState({ usernames: [] });

  const [activePostId, setActivePostId] = useState(null);
  const [visible, setvisible] = useState(null);
  const [replies, setreplies] = useState([]);

  const [comtext, setcomtext] = useState({ text: "" });
  const [replytext, setreplytext] = useState({ text: "" });

  const [isMobile, setIsMobile] = useState(false);
  
  const [isFetchingComments, setIsFetchingComments] = useState(false);
  const [isFetchingReplies, setIsFetchingReplies] = useState(false);

  // ✅ Animation state
  const [likeAnimation, setLikeAnimation] = useState(null);

  const context = useContext(ConnectContext);
  const {
    authdata,
    selfpost,
    idtouser,
    likepost,
    dislikepost,
    getcom,
    getreply,
    postreply,
    postcom,
  } = context;

  const inputRef = useRef(null);

  const handleClear = () => {
    if (inputRef.current) inputRef.current.value = "";
  };

  useEffect(() => {
    const detect = () => setIsMobile(window.innerWidth < 768);
    detect();
    window.addEventListener("resize", detect);
    return () => window.removeEventListener("resize", detect);
  }, []);

  useEffect(() => {
    setprofile({
      username: Cookies.get("username"),
      profilepic: Cookies.get("profile"),
      followers: Cookies.get("followers") || 0,
      following: Cookies.get("following") || 0,
      bio: Cookies.get("bio") || "No bio available",
      skills: Cookies.get("skills")
        ? Cookies.get("skills").split(",").map((s) => s.trim())
        : [],
    });
  }, []);

  const SubmitComment = async (postId) => {
    if (!comtext.text.trim()) return;
    const textToSend = comtext.text;

    // ✅ OPTIMISTIC: show comment instantly, no waiting
    const optimisticComment = { _id: `temp_${Date.now()}`, userid: authdata.userid, text: textToSend };
    setcom(prev => [...prev, optimisticComment]);
    setcomusers(prev => ({ usernames: [...(prev.usernames || []), Cookies.get('username') || 'You'] }));
    setposts(prev => prev.map(p =>
      p._id === postId ? { ...p, comments: [...(p.comments || []), optimisticComment] } : p
    ));
    setcomtext({ text: "" });

    try {
      await postcom(postId, authdata.authtoken, textToSend);
      // Silently replace temp with real DB data
      const allcom = await getcom(postId, authdata.authtoken);
      if (Array.isArray(allcom) && allcom.length > 0) {
        const usernames = await idtouser(allcom.map(c => c.userid));
        setcom(allcom);
        setcomusers(usernames);
      }
      // Update post comment count only — no full refetch
      const updated = await selfpost(authdata.authtoken);
      if (Array.isArray(updated)) {
        setposts(prev => updated.map(serverPost => {
          const local = prev.find(p => p._id === serverPost._id);
          return local ? { ...serverPost, likes: local.likes } : serverPost;
        }));
      }
    } catch (err) { console.error("SubmitComment error:", err); }
  };

  const Submitreply = async (comment_id) => {
    if (!replytext.text.trim()) return;
    const textToSend = replytext.text;

    // ✅ OPTIMISTIC: show reply instantly
    const optimisticReply = { _id: `temp_${Date.now()}`, userid: authdata.userid, text: textToSend };
    setreplies(prev => [...prev, optimisticReply]);
    setreplyusers(prev => ({ usernames: [...(prev.usernames || []), Cookies.get('username') || 'You'] }));
    setvisible(comment_id);
    setreplytext({ text: "" });
    handleClear();

    try {
      await postreply(comment_id, authdata.authtoken, textToSend);
      const replydata = await getreply(comment_id, authdata.authtoken);
      if (Array.isArray(replydata) && replydata.length > 0) {
        const usernames = await idtouser(replydata.map(r => r.userid));
        setreplies(replydata);
        setreplyusers(usernames);
      }
    } catch (err) { console.error("Submitreply error:", err); }
  };

  const handleCommentClick = async (postId) => {
    if (activePostId === postId) {
      setActivePostId(null);
      setcom([]);
      setcomusers({ usernames: [] });
      return;
    }
    // ✅ Clear + loading before opening — spinner on first render, no "No comments" flash
    setcom([]);
    setcomusers({ usernames: [] });
    setIsFetchingComments(true);
    setActivePostId(postId);

    try {
      const compost = await getcom(postId, authdata.authtoken);
      if (Array.isArray(compost) && compost.length > 0) {
        const usernames = await idtouser(compost.map(c => c.userid));
        setcom(compost);
        setcomusers(usernames);
      }
    } catch (err) { console.error(err); }
    finally { setIsFetchingComments(false); }
  };

  const handlelike = async (post, isLiked) => {
    setposts((prevPosts) => 
      prevPosts.map((p) => {
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
      console.error("Like action failed — rolling back", error);
      // Rollback optimistic update only, no full refetch
      setposts(prevPosts =>
        prevPosts.map(p => {
          if (p._id === post._id) {
            const rolledBack = isLiked
              ? [...p.likes, authdata?.userid]
              : p.likes.filter(id => String(id) !== String(authdata?.userid));
            return { ...p, likes: rolledBack };
          }
          return p;
        })
      );
    }
  };

  // ✅ New Double Tap Handler
  const handleDoubleTap = (post, isLiked) => {
    setLikeAnimation(post._id);
    setTimeout(() => setLikeAnimation(null), 1000);
    
    // Only like, never unlike on double-tap
    if (!isLiked) {
      handlelike(post, isLiked);
    }
  };

  const handlereply = async (comment_id) => {
    if (visible === comment_id) return setvisible(null);
    // ✅ Clear stale + loading before opening replies
    setreplies([]);
    setreplyusers({ usernames: [] });
    setIsFetchingReplies(true);
    setvisible(comment_id);

    try {
      const replydata = await getreply(comment_id, authdata.authtoken);
      if (Array.isArray(replydata) && replydata.length > 0) {
        const usernames = await idtouser(replydata.map(r => r.userid));
        setreplies(replydata);
        setreplyusers(usernames);
      }
    } catch (err) { console.error(err); }
    finally { setIsFetchingReplies(false); }
  };

  useEffect(() => {
    const load = async () => {
      const fetched = await selfpost(authdata.authtoken);
      setposts(fetched);
    };
    load();
  }, [authdata, selfpost]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white -mt-20 pt-20">
      
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

      <div className="grid grid-cols-12 gap-6 max-w-[1600px] mx-auto px-4 md:px-10 pb-10">

        {/* LEFT PROFILE */}
        <div className="col-span-12 md:col-span-3">
          <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/10 sticky top-0">

            <div className="flex flex-col items-center">
              <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-yellow-400">
                <img src={profile.profilepic || "https://i.pravatar.cc/300"} alt="" className="w-full h-full object-cover" />
              </div>

              <div className="mt-4 text-2xl font-semibold">{profile.username}</div>
              <div className="text-gray-400 text-sm mt-1">{profile.bio}</div>

              <button className="mt-4 bg-yellow-400 text-black px-5 py-2 rounded-lg font-semibold hover:opacity-90">
                Edit Profile
              </button>
            </div>

            <div className="mt-6 grid grid-cols-3 text-center">
              <div>
                <div className="text-xl font-bold">{posts.length}</div>
                <div className="text-xs text-gray-400">Posts</div>
              </div>
              <div>
                <div className="text-xl font-bold">{profile.followers}</div>
                <div className="text-xs text-gray-400">Followers</div>
              </div>
              <div>
                <div className="text-xl font-bold">{profile.following}</div>
                <div className="text-xs text-gray-400">Following</div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-lg font-semibold mb-2">Skills</div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.length > 0 ? (
                  profile.skills.map((s, idx) => (
                    <span key={idx} className="bg-[#262626] px-3 py-1 rounded-md text-sm">
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

        {/* CENTER POSTS */}
        <div className="col-span-12 md:col-span-6">
          <h1 className="text-2xl mb-4 font-semibold">Your Posts</h1>

          {posts.length > 0 ? (
            posts.map((post) => {
              const isLiked = post.likes?.some((id) => String(id) === String(authdata?.userid));

              return (
                <div key={post._id} className="bg-[#1a1a1a] rounded-2xl p-4 mb-6 border border-white/10">

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-yellow-400">
                      <img src={profile.profilepic || "https://i.pravatar.cc/300"} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-lg font-semibold">{profile.username}</div>
                  </div>

                  <div className="font-semibold mb-2">{post.description}</div>

                  {post.image && (
                    <div 
                      className="relative w-full h-72 rounded-xl overflow-hidden bg-black cursor-pointer"
                      onDoubleClick={() => handleDoubleTap(post, isLiked)} // ✅ Replaced inline logic
                    >
                      <img src={post.image} alt="" className="w-full h-full object-cover select-none" />
                      
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
                    </div>
                  )}

                  <div className="flex items-center mt-3 gap-6">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handlelike(post, isLiked)}
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
                      className="flex items-center gap-2 transition hover:opacity-80" 
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
                        onChange={(e) => setcomtext({ text: e.target.value })}
                        className="flex-1 bg-[#111] px-4 py-2 rounded-full border border-white/10 focus:outline-none focus:border-yellow-400"
                      />
                      <button
                        onClick={() => SubmitComment(post._id)}
                        className="bg-yellow-400 text-black px-4 py-2 rounded-full font-semibold"
                      >
                        Send
                      </button>
                    </div>
                  )}

                  {/* MOBILE COMMENTS */}
                  {isMobile && activePostId === post._id && (
                    <div className="mt-5 bg-[#111] p-4 rounded-xl border border-white/5">

                      {isFetchingComments ? (
                        <div className="flex justify-center py-4"><Loader2 className="animate-spin text-yellow-400" size={24} /></div>
                      ) : com.length === 0 ? (
                        <div className="text-gray-400 text-center">No comments yet</div>
                      ) : com.map((c, idx) => (
                        <div key={c._id} className="mb-4 bg-[#1a1a1a] p-3 rounded-lg border border-white/5">

                          <div className="font-semibold text-gray-200">{comusers.usernames[idx]}</div>
                          <div className="text-gray-300 mt-1">{c.text}</div>

                          <div className="mt-3 pl-3 border-l-2 border-yellow-400">
                            {visible === c._id && (
                              isFetchingReplies
                                ? <div className="flex items-center gap-1 mb-2"><Loader2 className="animate-spin text-yellow-400" size={12} /><span className="text-xs text-gray-500">Loading replies...</span></div>
                                : replies.length > 0
                                  ? replies.map((r, i) => (
                                      <div key={i} className="text-sm text-gray-300 mb-2">
                                        <span className="font-semibold text-gray-100">{replyusers.usernames[i]}:</span>{" "}
                                        {r.text}
                                      </div>
                                    ))
                                  : <div className="text-xs text-gray-500 mb-1">No replies yet</div>
                            )}
                            <button
                              className="text-yellow-400 text-xs mt-1 font-medium"
                              onClick={() => handlereply(c._id)}
                            >
                              {visible === c._id ? "Hide replies" : "View replies"}
                            </button>
                          </div>

                          <div className="mt-3 flex gap-2">
                            <input
                              ref={inputRef}
                              placeholder="Reply..."
                              className="flex-1 bg-[#000] px-3 py-2 rounded-lg border border-white/10 text-sm focus:outline-none focus:border-yellow-400"
                              onChange={(e) =>
                                setreplytext({ text: e.target.value })
                              }
                            />
                            <button
                              className="bg-yellow-400 text-black px-3 py-1 rounded-lg text-sm font-semibold"
                              onClick={() => Submitreply(c._id)}
                            >
                              Send
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-400 mt-10 bg-[#1a1a1a] py-10 rounded-2xl border border-white/10">
              No Posts Yet
            </div>
          )}
        </div>

        {/* DESKTOP COMMENT PANEL */}
        {!isMobile && (
          <div className="col-span-12 md:col-span-3">
            <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/10 sticky top-0 h-fit">

              {!activePostId ? (
                <div className="text-gray-400 text-center">Select a post to view comments</div>
              ) : (
                <>
                  <div className="text-lg font-semibold mb-4 text-gray-300">
                    Comments on {profile.username}'s post
                  </div>

                  {isFetchingComments ? (
                    <div className="flex justify-center py-4"><Loader2 className="animate-spin text-yellow-400" size={24} /></div>
                  ) : com.length > 0 ? (
                    com.map((comment, idx) => (
                      <div key={comment._id} className="bg-[#111] p-3 rounded-xl mb-3 border border-white/5">
                        <div className="font-semibold text-gray-200">
                          {comusers.usernames[idx]}
                          <button
                            className="ml-3 text-yellow-400 text-xs font-medium"
                            onClick={() => handlereply(comment._id)}
                          >
                            replies
                          </button>
                        </div>

                        <div className="text-gray-400 mt-1 text-sm">{comment.text}</div>

                        {visible === comment._id && (
                          <div className="mt-2 pl-3 border-l-2 border-yellow-400">
                            {isFetchingReplies
                              ? <div className="flex items-center gap-1 py-1"><Loader2 className="animate-spin text-yellow-400" size={12} /><span className="text-xs text-gray-500">Loading replies...</span></div>
                              : replies.length > 0
                                ? replies.map((r, i) => (
                                    <div key={i} className="text-sm text-gray-300 mb-1">
                                      <span className="font-semibold text-gray-100">{replyusers.usernames[i]}:</span>{" "}
                                      {r.text}
                                    </div>
                                  ))
                                : <div className="text-gray-500 text-sm">No replies yet</div>
                            }
                          </div>
                        )}

                        <div className="mt-3 flex gap-2">
                          <input
                            ref={inputRef}
                            placeholder="Reply..."
                            className="flex-1 bg-[#000] px-3 py-2 rounded-lg border border-white/10 text-sm focus:outline-none focus:border-yellow-400"
                            onChange={(e) =>
                              setreplytext({ text: e.target.value })
                            }
                          />
                          <button
                            className="bg-yellow-400 text-black px-3 py-1 rounded-lg text-sm font-semibold"
                            onClick={() => Submitreply(comment._id)}
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

export default Profile;