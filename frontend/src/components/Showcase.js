import React, { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ConnectContext from "../context/Connectcontext";
import Like from "../assets/like.svg";
import commentss from "../assets/comment.svg";
import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";

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
    frequest,        // ✅ Imported to send follow back request
    remfollower,     // ✅ Imported to remove follower
    postLoading,
    commentLoading,
    replyLoading
  } = context;

  const [posts, setposts] = useState([]);
  const [com, setcom] = useState([]);
  const [comusers, setcomusers] = useState({ usernames: [] });
  const [replyusers, setreplyusers] = useState({ usernames: [] });
  const [users, setusers] = useState({ usernames: [] });
  const [like, setlike] = useState(false);
  const [activePostId, setActivePostId] = useState(null);

  const [comtext, setcomtext] = useState({ text: "" });
  const [replytext, setreplytext] = useState({ text: "" });

  const [visible, setvisible] = useState(null);
  const [replies, setreplies] = useState([]);

  const [followback, setfollowback] = useState([]);
  const [fpic, setfpic] = useState([]);
  
  // ✅ Track who we've sent a follow request to so button says "Requested"
  const [requestedIds, setRequestedIds] = useState([]); 

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
    await postcom(postId, authdata.authtoken, comtext.text);
    const allcom = await getcom(postId, authdata.authtoken);
    const useridarray = allcom.map((c) => c.userid);
    const usernames = await idtouser(useridarray);
    setcom(allcom);
    setcomusers(usernames);
    setcomtext({ text: "" });
    handleClear();
    const allpost = await getallpost(authdata.authtoken);
    setposts(allpost);
  };

  const Submitreply = async (comment_id) => {
    await postreply(comment_id, authdata.authtoken, replytext.text);
    const allreply = await getreply(comment_id, authdata.authtoken);
    const useridarray = allreply.map((r) => r.userid);
    const usernames = await idtouser(useridarray);
    setreplyusers(usernames);
    setreplies(allreply);
    setvisible(comment_id);
    setreplytext({ text: "" });
    handleClear();
    const allpost = await getallpost(authdata.authtoken);
    setposts(allpost);
  };

  const handleCommentClick = async (postId) => {
    if (activePostId === postId) {
      setActivePostId(null);
      setcom([]);
      return;
    }
    setActivePostId(postId);
    const compost = await getcom(postId, authdata.authtoken);
    const useridarray = compost.map((c) => c.userid);
    const usernames = await idtouser(useridarray);
    setcom(compost);
    setcomusers(usernames);
  };

  const handlelike = async (post) => {
    if (like) {
      await dislikepost(post._id, authdata.authtoken);
      setlike(false);
    } else {
      await likepost(post._id, authdata.authtoken);
      setlike(true);
    }
    const updated = await getallpost(authdata.authtoken);
    setposts(updated);
  };

  const handlereply = async (comment_id) => {
    if (visible === comment_id) return setvisible(null);
    setvisible(comment_id);
    const replydata = await getreply(comment_id, authdata.authtoken);
    const useridarray = replydata.map((r) => r.userid);
    const usernames = await idtouser(useridarray);
    setreplies(replydata);
    setreplyusers(usernames);
  };

  // ✅ Remove Follower Handler
  const handleRemove = async (id) => {
    await remfollower(id);
    // Remove user from the local state list immediately for a snappy UI
    setfollowback((prev) => prev.filter((f) => f._id !== id));
  };

// ✅ Follow Back Handler
  const handleFollowBack = async (username, id) => {
    const res = await frequest(username);
    
    if (res) {
      // 1. Change button text to "Requested" instantly
      setRequestedIds((prev) => [...prev, id]);

      // 2. Remove the user from the UI after 2 seconds to clean up the list dynamically
      setTimeout(() => {
        setfollowback((prev) => prev.filter((f) => f._id !== id));
      }, 2000);
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      const fetchedPosts = await getallpost(authdata.authtoken);
      setposts(fetchedPosts);
      if (fetchedPosts) {
        const useridarray = fetchedPosts.map((p) => p.userid);
        const usernames = await idtouser(useridarray);
        setusers(usernames);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const following_pics = await profile_following();
      setfpic(following_pics);
      const dont_f_back = await only_followers();
      setfollowback(dont_f_back);
    };
    fetchData();
  }, [profile_following, only_followers]);

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white -mt-20 pt-20">
      
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 pb-10">
        <div className="grid grid-cols-12 gap-6">
          
          {/* LEFT PROFILE (Hidden on Mobile) */}
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

            <div className="flex items-center gap-4 mb-4 overflow-x-auto pb-2 scrollbar-hide">
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
                {posts.map((post, index) => (
                  <article key={post._id || index} className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">

                    {/* HEADER */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img src="https://i.pravatar.cc/300" alt="profile" className="w-full h-full object-cover" />
                      </div>
                      <div className="font-semibold">{users.usernames[index] || "unknown"}</div>
                    </div>

                    <div className="text-gray-200 mb-4">{post.description}</div>

                    {post.image && (
                      <div className="mb-4">
                        <img src={post.image} alt="post" className="w-full rounded-lg border border-black/40 object-contain max-h-[66vh]" />
                      </div>
                    )}

                    {/* LIKE + COMMENT */}
                    <div className="flex items-center gap-6 text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <button onClick={async () => await handlelike(post)}>
                          <img src={Like} alt="like" className="w-5 h-5" />
                        </button>
                        <div>{post.likes.length}</div>
                      </div>

                      <button onClick={() => handleCommentClick(post._id)} className="flex items-center gap-2">
                        <img src={commentss} alt="comments" className="w-5 h-5" />
                        <span>
                          {activePostId === post._id ? "Hide" : "Show"} {post.comments.length}
                        </span>
                      </button>
                    </div>

                    {/* COMMENT INPUT */}
                    <div className="flex items-center gap-3">
                      <input
                        ref={inputRef}
                        placeholder="Write a comment"
                        onChange={(e) => setcomtext({ text: e.target.value })}
                        className="flex-1 bg-[#111] rounded-full py-3 px-4 border border-white/10"
                      />
                      <button
                        onClick={() => SubmitComment(post._id)}
                        className="bg-yellow-400 text-black px-4 py-2 rounded-full font-semibold hover:opacity-90"
                      >
                        Send
                      </button>
                    </div>

                    {/* COMMENTS SECTION */}
                    {activePostId === post._id && (
                      <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                        
                        {commentLoading ? (
                           <div className="flex justify-center py-4">
                             <Loader2 className="animate-spin text-yellow-400" size={24} />
                           </div>
                        ) : (
                          <>
                            {com.length > 0 ? com.map((c, idx) => (
                              <div key={idx} className="bg-[#111] p-3 rounded-lg">

                                <div className="font-semibold text-gray-300 mb-1">
                                  {comusers.usernames[idx] || "user"}
                                </div>

                                <div className="text-gray-400 mb-1">{c.text}</div>

                                <button onClick={() => handlereply(c._id)} className="text-sm text-yellow-400">
                                  {visible === c._id ? "Hide Replies" : "Show Replies"}
                                </button>

                                {/* REPLIES SECTION */}
                                {visible === c._id && (
                                  <div className="mt-3">
                                    {replyLoading ? (
                                       <div className="flex items-center gap-2 mb-2 ml-4">
                                          <Loader2 className="animate-spin text-yellow-400" size={16} />
                                          <span className="text-xs text-gray-500">Loading replies...</span>
                                       </div>
                                    ) : (
                                      <>
                                        {replies.length > 0 && (
                                          <div className="mb-3 space-y-2 text-sm pl-4 border-l-2 border-white/10">
                                            {replies.map((r, ridx) => (
                                              <div key={ridx} className="text-gray-300">
                                                <span className="font-semibold text-gray-400">{replyusers.usernames[ridx] || "user"}:</span>{" "}
                                                {r.text}
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </>
                                    )}

                                    <div className="flex gap-2">
                                      <input
                                        placeholder="Reply..."
                                        onChange={(e) => setreplytext({ text: e.target.value })}
                                        className="flex-1 bg-[#000] rounded-full py-2 px-3 border border-white/10 text-sm"
                                      />
                                      <button
                                        onClick={() => Submitreply(c._id)}
                                        className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-bold"
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
                ))}
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
                    <div key={idx} className="bg-[#111] rounded-lg p-3 flex items-center gap-3">

                      <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-yellow-400 shrink-0">
                        {/* ✅ Updated to use the profilepic from DB */}
                        <img src={f.profilepic || "https://i.pravatar.cc/300"} alt="rec" className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{f.username}</div>
                        <div className="text-sm text-yellow-400">Follows you</div>
                      </div>

                      <div className="flex flex-col gap-2 w-32">
                        {/* ✅ Remove Button Configured */}
                        <button 
                          onClick={() => handleRemove(f._id)}
                          className="bg-[#333] hover:bg-[#444] rounded-md py-1.5 text-sm transition"
                        >
                          Remove
                        </button>
                        
                        {/* ✅ Follow Back Button Configured */}
                        <button 
                          onClick={() => handleFollowBack(f.username, f._id)}
                          disabled={hasRequested}
                          className={`${
                            hasRequested 
                              ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                              : 'bg-yellow-400 hover:opacity-90 text-black'
                          } rounded-md py-1.5 text-sm font-bold transition`}
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