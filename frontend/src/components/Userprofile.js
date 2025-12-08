import React, { useContext, useEffect, useRef, useState } from "react";
import Connect_Context from "../context/Connectcontext";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";

import Like from "../assets/like.svg";
import commentss from "../assets/comment.svg";

const Userprofile = () => {
  const navigate = useNavigate();
  const { userid } = useParams();

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

  const context = useContext(Connect_Context);

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

  // RESET DATA WHEN SWITCHING USER PROFILE
  useEffect(() => {
    setPosts([]);
    setCom([]);
    setActivePostId(null);
    setVisible(null);
  }, [userid]);

  const handleClear = () => {
    if (inputRef.current) inputRef.current.value = "";
  };

  // ------------------ LOAD USER INFO ----------------------
  const loadUserInfo = async () => {
    try {
      const response = await fetch(
        `https://connectify-aml7.onrender.com/api/auth/userinfo/${userid}`,
        {
          method: "GET",
          credentials: "include",
        }
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
  };

  // ------------------ LOAD POSTS (only if following) ----------------------
  const loadUserPosts = async () => {
    if (fstatus !== "Following") {
      setPostMessage("Follow this user to see their posts");
      setPosts([]);
      return;
    }

    const fetched = await followpost(profile.username);

    if (fetched.message) setPostMessage(fetched.message);
    else setPosts(fetched);
  };

  // ------------------ LIKE (FIXED: toggle) ----------------------
  const handleLike = async (post) => {
    try {
      // if authdata.userid exists in post.likes -> dislike, else like
      const currentUserId = authdata?.userid;
      const hasLiked =
        Array.isArray(post.likes) && currentUserId
          ? post.likes.includes(currentUserId)
          : false;

      if (hasLiked) {
        await dislikepost(post._id, authdata.authtoken);
      } else {
        await likepost(post._id, authdata.authtoken);
      }

      // refresh posts after mutation
      await loadUserPosts();
    } catch (error) {
      console.error("handleLike error:", error);
    }
  };

  // ------------------ COMMENTS ----------------------
  const handleCommentClick = async (postId) => {
    if (activePostId === postId) {
      setActivePostId(null);
      setCom([]);
      return;
    }

    setActivePostId(postId);

    const compost = await getcom(postId, authdata.authtoken);
    const useridarray = compost.map((c) => c.userid);
    const usernames = await idtouser(useridarray);

    setComUsers(usernames);
    setCom(compost);
  };

  // ------------------ REPLIES ----------------------
  const handleReplyClick = async (comment_id) => {
    if (visible === comment_id) return setVisible(null);

    const replydata = await getreply(comment_id, authdata.authtoken);
    const useridarray = replydata.map((r) => r.userid);
    const usernames = await idtouser(useridarray);

    setReplyUsers(usernames);
    setReplies(replydata);
    setVisible(comment_id);
  };

  const SubmitReply = async (comment_id) => {
    await postreply(comment_id, authdata.authtoken, replytext.text);
    handleReplyClick(comment_id);
    handleClear();
    setReplyText({ text: "" });
  };

  // ------------------ COMMENT SUBMIT ----------------------
  const SubmitComment = async (postId) => {
    await postcom(postId, authdata.authtoken, comtext.text);

    handleCommentClick(postId);
    setComText({ text: "" });
    handleClear();
  };

  // ------------------ FOLLOW STATUS ----------------------
  const loadFollowStatus = async () => {
    const data = await reqstatus(userid);

    if (data.message) setFstatus("Follow");
    else {
      const stat = data.followRequests[0].status;
      if (stat === "pending") setFstatus("Requested");
      else if (stat === "accepted") setFstatus("Following");
      else setFstatus("Follow");
    }
  };

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

  // ------------------ EFFECTS ----------------------
  useEffect(() => {
    loadUserInfo();
  }, [userid]);

  useEffect(() => {
    loadFollowStatus();
  }, [userid]);

  useEffect(() => {
    if (profile.username) loadUserPosts();
  }, [profile.username, fstatus]);

  return (
    // ✅ FIXED: Added -mt-20 to pull background up, pt-20 to push content down
    // ✅ FIXED: Background #0f0f0f
    <div className="min-h-screen bg-[#0f0f0f] -mt-20 pt-20 px-4 md:px-10 pb-10 text-white">
      
      <div className="grid grid-cols-12 gap-6 max-w-[1600px] mx-auto">
        {/* LEFT PROFILE CARD */}
        <div className="col-span-12 md:col-span-3">
          {/* ✅ FIXED: bg-[#1a1a1a] border border-white/10 */}
          <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/10 sticky top-24">
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-yellow-400">
                <img
                  // src={profile.profilepic}
                  src = "https://i.pravatar.cc/300"
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mt-4 text-2xl font-semibold">
                {profile.username}
              </div>

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

                <button className="py-2 px-4 rounded-full bg-[#333] hover:bg-[#444] border border-white/10 transition">Message</button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-3 text-center">
              <div>
                <div className="text-xl font-bold">{posts.length}</div>
                <div className="text-xs text-gray-400">Posts</div>
              </div>

              <div>
                <div className="text-xl font-bold">
                  {profile.followers.length}
                </div>
                <div className="text-xs text-gray-400">Followers</div>
              </div>

              <div>
                <div className="text-xl font-bold">{profile.following.length}</div>
                <div className="text-xs text-gray-400">Following</div>
              </div>
            </div>

            {/* Skills */}
            <div className="mt-6">
              <div className="text-lg font-semibold mb-2">Skills</div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.length > 0 ? (
                  profile.skills.map((s, i) => (
                    <span key={i} className="bg-[#262626] px-3 py-1 rounded-md text-sm border border-white/5">
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
          <h1 className="text-2xl mb-4 font-semibold">{profile.username}'s Posts</h1>

          {/* IF NOT FOLLOWING */}
          {fstatus !== "Following" ? (
            <div className="bg-[#1a1a1a] p-8 text-center rounded-2xl text-gray-400 border border-white/10">
              Follow {profile.username} to see their posts
            </div>
          ) : posts.length > 0 ? (
            posts.map((post, index) => (
              // ✅ FIXED: bg-[#1a1a1a] and border
              <div key={index} className="bg-[#1a1a1a] rounded-2xl p-4 mb-6 border border-white/10">
                {/* USER HEADER ABOVE EVERY POST */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-yellow-400">
                    <img
                      // src={profile.profilepic}
                      src ="https://i.pravatar.cc/300"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="text-lg font-semibold">{profile.username}</div>
                </div>

                {/* DESCRIPTION */}
                <div className="font-semibold mb-2 text-gray-200">{post.description}</div>

                {/* IMAGE */}
                <div className="w-full rounded-xl overflow-hidden">
                  {post.image ? (
                    <img src={post.image} className="w-full object-cover max-h-[66vh] border border-black/40" alt="" />
                  ) : (
                    <div className="text-gray-400 py-10 text-center bg-black/20">No Image</div>
                  )}
                </div>

                {/* LIKE + COMMENT */}
                <div className="flex items-center mt-3 gap-6">
                  <div
                    className="flex items-center gap-2 cursor-pointer text-sm"
                    onClick={() => handleLike(post)}
                  >
                    <img src={Like} alt="" className="w-5 h-5" />
                    {post.likes.length}
                  </div>

                  <div
                    className="flex items-center gap-2 cursor-pointer text-sm"
                    onClick={() => handleCommentClick(post._id)}
                  >
                    <img src={commentss} alt="" className="w-5 h-5" />
                    {post.comments.length}
                  </div>
                </div>

                {/* COMMENT INPUT */}
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
            ))
          ) : (
            <div className="bg-[#1a1a1a] p-8 text-center rounded-2xl text-gray-400 border border-white/10">
              {postMessage}
            </div>
          )}
        </div>

        {/* RIGHT COMMENT PANEL */}
        {fstatus === "Following" && (
          <div className="col-span-12 md:col-span-3">
            {/* ✅ FIXED: bg-[#1a1a1a] */}
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

                  {com.length > 0 ? (
                    com.map((comment, idx) => (
                      <div key={idx} className="bg-[#111] p-3 mb-3 rounded-xl border border-white/5">
                        <div className="font-semibold text-gray-200">{comusers.usernames[idx]}</div>
                        <div className="text-gray-400 mt-1 text-sm">{comment.text}</div>

                        <button
                          className="mt-2 text-yellow-400 text-xs font-medium"
                          onClick={() => handleReplyClick(comment._id)}
                        >
                          Show replies
                        </button>

                        {visible === comment._id && (
                          <div className="mt-3 border-l-2 border-yellow-400 pl-3">
                            {replies.map((reply, i) => (
                              <p key={i} className="text-gray-300 text-sm mb-1">
                                <b className="text-gray-100">{replyusers.usernames[i]}</b>: {reply.text}
                              </p>
                            ))}
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
                    <div className="text-gray-400">No comments yet</div>
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