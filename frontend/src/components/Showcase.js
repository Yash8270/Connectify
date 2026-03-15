import React, { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ConnectContext from "../context/Connectcontext";
import commentss from "../assets/comment.svg";
import Cookies from "js-cookie";
import { Loader2, Heart } from "lucide-react";

const Showcase = () => {
  const inputRef = useRef(null);

  const context = useContext(ConnectContext);
  const {
    authdata,
    getallpost,
    idtouser,
    likepost,
    dislikepost,
    getcom,
    postcom,
    getreply,
    postreply,
    profile_following,
    only_followers,
    frequest,
    remfollower,
    postLoading,
  } = context;

  const [posts, setposts] = useState([]);
  const [com, setcom] = useState([]);
  const [comusers, setcomusers] = useState({ usernames: [] });
  const [replyusers, setreplyusers] = useState({ usernames: [] });
  const [users, setusers] = useState({ usernames: [] });
  const [activePostId, setActivePostId] = useState(null);

  const [comtext, setcomtext] = useState({ text: "" });
  const [replytext, setreplytext] = useState({ text: "" });

  const [visible, setvisible] = useState(null);
  const [replies, setreplies] = useState([]);

  const [followback, setfollowback] = useState([]);
  const [fpic, setfpic] = useState([]);
  const [requestedIds, setRequestedIds] = useState([]); 

  const [isFetchingComments, setIsFetchingComments] = useState(false);
  const [isFetchingReplies, setIsFetchingReplies] = useState(false);
  
  // ✅ New Animation State for Double Tap
  const [likeAnimation, setLikeAnimation] = useState(null);

  const [profile, setProfile] = useState({
    username: "",
    profilepic: "",
    followers: 0,
    following: 0,
    bio: "",
    skills: [],
  });

  useEffect(() => {
    setProfile({
      username: Cookies.get("username"),
      profilepic: Cookies.get("profile"),
      followers: Cookies.get("followers") || 0,
      following: Cookies.get("following") || 0,
      bio: Cookies.get("bio") || "",
      skills: Cookies.get("skills")
        ? Cookies.get("skills").split(",").map((s) => s.trim())
        : [],
    });
  }, []);

  const handleClear = () => {
    if (inputRef.current) inputRef.current.value = "";
  };

  const SubmitComment = async (postId) => {
    if (!comtext.text.trim()) return;
    const textToSend = comtext.text;

    // ✅ OPTIMISTIC: append comment instantly to local list — no flash, no refetch
    const optimisticComment = {
      _id: `temp_${Date.now()}`,
      userid: authdata.userid,
      text: textToSend,
    };
    setcom(prev => [...prev, optimisticComment]);
    setcomusers(prev => ({ usernames: [...(prev.usernames || []), Cookies.get('username') || 'You'] }));

    // ✅ OPTIMISTIC: increment comment count on the post card immediately
    setposts(prev => prev.map(p =>
      p._id === postId
        ? { ...p, comments: [...(p.comments || []), optimisticComment] }
        : p
    ));

    setcomtext({ text: "" });
    handleClear();

    // Fire API in background — no await blocking the UI
    try {
      await postcom(postId, authdata.authtoken, textToSend);
      // Silently refresh comments to replace temp ID with real one from DB
      const [allcom, allpost] = await Promise.all([
        getcom(postId, authdata.authtoken),
        getallpost(),
      ]);
      if (Array.isArray(allcom) && allcom.length > 0) {
        const usernames = await idtouser(allcom.map(c => c.userid));
        setcom(allcom);
        setcomusers(usernames);
      }
      // Update posts WITHOUT clobbering like state — merge likes from current state
      if (Array.isArray(allpost)) {
        setposts(prev => allpost.map(serverPost => {
          const localPost = prev.find(p => p._id === serverPost._id);
          // Preserve local likes array to avoid flickering from race conditions
          return localPost ? { ...serverPost, likes: localPost.likes } : serverPost;
        }));
      }
    } catch (error) {
      console.error("SubmitComment error:", error);
    }
  };

  const Submitreply = async (comment_id) => {
    if (!replytext.text.trim()) return;
    const textToSend = replytext.text;

    // ✅ OPTIMISTIC: append reply instantly — no spinner, no flash
    const optimisticReply = {
      _id: `temp_${Date.now()}`,
      userid: authdata.userid,
      text: textToSend,
    };
    setreplies(prev => [...prev, optimisticReply]);
    setreplyusers(prev => ({ usernames: [...(prev.usernames || []), Cookies.get('username') || 'You'] }));
    setvisible(comment_id);
    setreplytext({ text: "" });
    handleClear();

    // Fire API in background
    try {
      await postreply(comment_id, authdata.authtoken, textToSend);
      // Silently replace temp reply with real data from DB
      const allreply = await getreply(comment_id, authdata.authtoken);
      if (Array.isArray(allreply) && allreply.length > 0) {
        const usernames = await idtouser(allreply.map(r => r.userid));
        setreplies(allreply);
        setreplyusers(usernames);
      }
    } catch (error) {
      console.error("Submitreply error:", error);
    }
  };

  const handlereply = async (comment_id) => {
    if (visible === comment_id) return setvisible(null);
    // ✅ Clear stale replies + set loading before revealing — no flash of old data
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
      } else {
        setreplies([]);
        setreplyusers({ usernames: [] });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingReplies(false);
    }
  };

  const handleCommentClick = async (postId) => {
    if (activePostId === postId) {
      setActivePostId(null);
      setcom([]);
      setcomusers({ usernames: [] });
      return;
    }
    // ✅ Clear stale data + set loading BEFORE opening section — all in one batch
    // This means the very first render of the section already shows the spinner
    setcom([]);
    setcomusers({ usernames: [] });
    setIsFetchingComments(true);
    setActivePostId(postId);

    try {
      const compost = await getcom(postId, authdata.authtoken);
      if (Array.isArray(compost) && compost.length > 0) {
        // ✅ Parallel: fetch usernames at same time as we process comments
        const usernames = await idtouser(compost.map(c => c.userid));
        setcom(compost);
        setcomusers(usernames);
      } else {
        setcom([]);
        setcomusers({ usernames: [] });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingComments(false);
    }
  };

  const handlelike = async (post, isLiked) => {
    // ✅ OPTIMISTIC: update like count instantly, no waiting for server
    setposts(prevPosts =>
      prevPosts.map(p => {
        if (p._id === post._id) {
          const updatedLikes = isLiked
            ? p.likes.filter(id => String(id) !== String(authdata?.userid))
            : [...p.likes, authdata?.userid];
          return { ...p, likes: updatedLikes };
        }
        return p;
      })
    );

    try {
      // Fire API — don't await for UI (already updated), just confirm server
      if (isLiked) {
        await dislikepost(post._id, authdata.authtoken);
      } else {
        await likepost(post._id, authdata.authtoken);
      }
      // ✅ No setposts after success — trust optimistic update, avoid flicker
    } catch (error) {
      console.error("Like action failed — rolling back", error);
      // Only rollback on actual failure
      setposts(prevPosts =>
        prevPosts.map(p => {
          if (p._id === post._id) {
            // Rollback: undo the optimistic change
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

  // ✅ New Double Tap Handler (Only likes, never unlikes)
  const handleDoubleTap = (post, isLiked) => {
    setLikeAnimation(post._id);
    setTimeout(() => setLikeAnimation(null), 1000); // Remove animation after 1 sec
    
    // Only call like API if it's currently NOT liked
    if (!isLiked) {
      handlelike(post, isLiked);
    }
  };

  const handleRemove = async (id) => {
    await remfollower(id);
    setfollowback((prev) => prev.filter((f) => f._id !== id));
  };

  const handleFollowBack = async (username, id) => {
    const res = await frequest(username);
    if (res) {
      setRequestedIds((prev) => [...prev, id]);
      setTimeout(() => {
        setfollowback((prev) => prev.filter((f) => f._id !== id));
      }, 2000);
    }
  };

  useEffect(() => {
    if (!authdata?.userid) return;
    const fetchPosts = async () => {
      const fetchedPosts = await getallpost();
      const safePosts = Array.isArray(fetchedPosts) ? fetchedPosts : [];
      setposts(safePosts);
      if (safePosts.length > 0) {
        const useridarray = safePosts.map((p) => p.userid);
        const usernames = await idtouser(useridarray);
        setusers(usernames);
      }
    };
    fetchPosts();
  }, [authdata?.userid, getallpost, idtouser]);

  useEffect(() => {
    if (!authdata?.userid) return;
    const fetchData = async () => {
      const following_pics = await profile_following();
      setfpic(Array.isArray(following_pics) ? following_pics : []);
      const dont_f_back = await only_followers();
      setfollowback(Array.isArray(dont_f_back) ? dont_f_back : []);
    };
    fetchData();
  }, [authdata?.userid, profile_following, only_followers]);

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white -mt-20 pt-20">
      
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

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 pb-10">
        <div className="grid grid-cols-12 gap-6">
          
          {/* LEFT PROFILE */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="space-y-6 sticky top-24">
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-28 h-28 rounded-full ring-4 ring-yellow-400 overflow-hidden">
                    <img src={profile.profilepic || "https://i.pravatar.cc/300"} alt="profile" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center gap-10 mt-2">
                    <div className="text-center">
                      <div className="text-sm font-bold">{profile.followers}</div>
                      <div className="text-xs text-gray-400">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold">{profile.following}</div>
                      <div className="text-xs text-gray-400">Following</div>
                    </div>
                  </div>
                  <div className="text-xl font-bold mt-1">{profile.username}</div>
                  <div className="text-sm text-gray-300 text-center">{profile.bio || "No bio available"}</div>
                  <Link to={`/profile/${authdata.userid}`} className="w-full">
                    <div className="mt-4 bg-[#222] hover:bg-[#2a2a2a] transition text-center font-bold py-2 rounded-full border border-white/10">
                      My Profile
                    </div>
                  </Link>
                </div>
              </div>

              {/* SKILLS */}
              <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10">
                <div className="text-lg font-bold mb-3">Skills</div>
                <div className="grid grid-cols-1 gap-3">
                  {profile.skills.length > 0 ? (
                    profile.skills.map((s, idx) => (
                      <div key={idx} className="bg-[#262626] rounded-md px-3 py-1 text-sm font-semibold">
                        {s}
                      </div>
                    ))
                  ) : (
                    <div className="bg-[#262626] rounded-md px-3 py-2 text-sm font-semibold">
                      No skills found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* CENTER FEED */}
          <section className="col-span-12 lg:col-span-6">
            <div className="flex items-center gap-4 mb-4 overflow-x-auto pl-1 pt-4 pb-2 scrollbar-hide">
              {fpic && fpic.length > 0 ? fpic.map((f, i) => (
                <div key={i} className="w-12 h-12 rounded-full ring-2 ring-yellow-400 overflow-hidden shrink-0">
                  <img src={f.profilepic || "https://i.pravatar.cc/300"} alt="follow" className="w-full h-full object-cover" />
                </div>
              )) : <div className="text-gray-400 text-sm">No followers</div>}
            </div>

            {postLoading && posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-yellow-400 mb-4" size={48} />
                <p className="text-gray-400">Loading Feed...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post, index) => {
                  const isLiked = post.likes?.some((id) => String(id) === String(authdata?.userid));

                  return (
                    <article key={post._id || index} className="bg-[#1a1a1a] rounded-xl p-4 md:p-6 border border-white/10">
                      {/* HEADER */}
                      <div className="flex items-center gap-3 md:gap-4 mb-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden shrink-0">
                          <img src="https://i.pravatar.cc/300" alt="profile" className="w-full h-full object-cover" />
                        </div>
                        <div className="font-semibold text-sm md:text-base">{users.usernames[index] || "unknown"}</div>
                      </div>

                      <div className="text-gray-200 text-sm md:text-base mb-4">{post.description}</div>

                      {post.image && (
                        <div 
                          className="relative mb-4 cursor-pointer bg-black rounded-lg overflow-hidden border border-black/40"
                          onDoubleClick={() => handleDoubleTap(post, isLiked)}
                        >
                          <img src={post.image} alt="post" className="w-full object-contain max-h-[66vh] select-none" />
                          
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

                      {/* LIKE + COMMENT */}
                      <div className="flex items-center gap-6 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handlelike(post, isLiked)}
                            className="transition transform active:scale-75 shrink-0"
                          >
                            <Heart 
                              className={`w-5 h-5 md:w-6 md:h-6 transition-colors duration-200 ${
                                isLiked 
                                  ? "fill-yellow-400 text-yellow-400" 
                                  : "text-white hover:text-gray-300"
                              }`} 
                            />
                          </button>
                          <div className="font-semibold text-sm md:text-base">{post.likes?.length || 0}</div>
                        </div>

                        <button onClick={() => handleCommentClick(post._id)} className="flex items-center gap-2 transition hover:opacity-80 shrink-0">
                          <img src={commentss} alt="comments" className="w-5 h-5 md:w-6 md:h-6" />
                          <span className="font-semibold text-sm md:text-base">
                            {post.comments?.length || 0}
                          </span>
                        </button>
                      </div>

                      {/* COMMENT INPUT */}
                      <div className="flex items-center gap-2 md:gap-3">
                        <input
                          ref={inputRef}
                          placeholder="Write a comment"
                          onChange={(e) => setcomtext({ text: e.target.value })}
                          className="flex-1 min-w-0 bg-[#111] rounded-full py-2.5 px-4 md:py-3 border border-white/10 text-sm md:text-base focus:outline-none focus:border-yellow-400"
                        />
                        <button
                          onClick={() => SubmitComment(post._id)}
                          disabled={!comtext.text.trim() || isFetchingComments}
                          className="shrink-0 bg-yellow-400 text-black px-4 py-2.5 md:py-3 rounded-full text-sm md:text-base font-semibold hover:opacity-90 transition disabled:opacity-50"
                        >
                          Send
                        </button>
                      </div>

                      {/* COMMENTS SECTION */}
                      {activePostId === post._id && (
                        <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                          {isFetchingComments ? (
                            <div className="flex justify-center py-4">
                              <Loader2 className="animate-spin text-yellow-400" size={24} />
                            </div>
                          ) : (
                            <>
                              {com.length > 0 ? com.map((c, idx) => (
                                <div key={idx} className="bg-[#111] p-3 md:p-4 rounded-lg">
                                  <div className="font-semibold text-gray-300 text-sm md:text-base mb-1">
                                    {comusers.usernames[idx] || "user"}
                                  </div>
                                  <div className="text-gray-400 text-sm mb-2">{c.text}</div>
                                  <button onClick={() => handlereply(c._id)} className="text-xs md:text-sm text-yellow-400 hover:underline">
                                    {visible === c._id ? "Hide Replies" : "Show Replies"}
                                  </button>

                                  {/* REPLIES SECTION */}
                                  {visible === c._id && (
                                    <div className="mt-3">
                                      {isFetchingReplies ? (
                                        <div className="flex items-center gap-2 mb-2 ml-4">
                                            <Loader2 className="animate-spin text-yellow-400" size={14} />
                                            <span className="text-xs text-gray-500">Loading replies...</span>
                                        </div>
                                      ) : (
                                        <>
                                          {replies.length > 0 && (
                                            <div className="mb-3 space-y-2 text-xs md:text-sm pl-4 border-l-2 border-white/10">
                                              {replies.map((r, ridx) => (
                                                <div key={ridx} className="text-gray-300 break-words">
                                                  <span className="font-semibold text-gray-400">{replyusers.usernames[ridx] || "user"}:</span>{" "}
                                                  {r.text}
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </>
                                      )}

                                      {/* REPLY INPUT */}
                                      <div className="flex items-center gap-2 mt-2">
                                        <input
                                          placeholder="Reply..."
                                          onChange={(e) => setreplytext({ text: e.target.value })}
                                          className="flex-1 min-w-0 bg-[#000] rounded-full py-2 px-3 md:px-4 border border-white/10 text-xs md:text-sm focus:outline-none focus:border-yellow-400 transition"
                                        />
                                        <button
                                          onClick={() => Submitreply(c._id)}
                                          disabled={!replytext.text.trim() || isFetchingReplies}
                                          className="shrink-0 bg-yellow-400 text-black px-3 py-2 md:px-4 rounded-full text-xs md:text-sm font-bold hover:opacity-90 transition disabled:opacity-50"
                                        >
                                          Send
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )) : <div className="text-gray-500 text-sm">No comments yet.</div>}
                            </>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* RIGHT COLUMN */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10 sticky top-24">
              <div className="font-semibold mb-3 text-gray-400">
                Accounts You don't follow back
              </div>
              <div className="space-y-4 max-h-[62vh] overflow-auto pr-2 custom-scrollbar">
                {followback && followback.length > 0 ? followback.map((f, idx) => {
                  const hasRequested = requestedIds.includes(f._id);
                  return (
                    <div key={idx} className="bg-[#111] rounded-lg p-2.5 xl:p-3 flex items-center gap-2 xl:gap-3">
                      <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-full overflow-hidden ring-2 ring-yellow-400 shrink-0">
                        <img src={f.profilepic || "https://i.pravatar.cc/300"} alt="rec" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{f.username}</div>
                        <div className="text-[10px] xl:text-xs text-yellow-400 truncate">Follows you</div>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button 
                          onClick={() => handleRemove(f._id)}
                          className="bg-[#333] hover:bg-[#444] rounded-md py-1 px-2 text-[10px] xl:text-xs transition whitespace-nowrap"
                        >
                          Remove
                        </button>
                        <button 
                          onClick={() => handleFollowBack(f.username, f._id)}
                          disabled={hasRequested}
                          className={`${
                            hasRequested 
                              ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                              : 'bg-yellow-400 hover:opacity-90 text-black'
                          } rounded-md py-1 px-2 text-[10px] xl:text-xs font-bold transition whitespace-nowrap`}
                        >
                          {hasRequested ? "Requested" : "Follow Back"}
                        </button>
                      </div>
                    </div>
                  );
                }) : <div className="text-gray-400 text-sm">There are no such accounts</div>}
              </div>
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
};

export default Showcase;