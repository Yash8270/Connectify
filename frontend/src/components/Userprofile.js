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
        `http://localhost:5000/api/auth/userinfo/${userid}`,
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
    <div className="min-h-screen bg-[#151515] pt-24 px-4 md:px-10 pb-10 text-white">
      <div className="grid grid-cols-12 gap-6 max-w-[1600px] mx-auto">
        {/* LEFT PROFILE CARD */}
        <div className="col-span-12 md:col-span-3">
          <div className="bg-[#222] p-6 rounded-2xl shadow-lg sticky top-24">
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
                  className={`flex-1 py-2 rounded-full font-semibold ${
                    fstatus === "Following"
                      ? "bg-gray-700 border border-white/20"
                      : "bg-yellow-400 text-black"
                  }`}
                  onClick={handleFollowRequest}
                >
                  {fstatus}
                </button>

                <button className="py-2 px-4 rounded-full bg-[#333]">Message</button>
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
                    <span key={i} className="bg-[#333] px-3 py-1 rounded-md text-sm">
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
            <div className="bg-[#222] p-8 text-center rounded-2xl text-gray-300">
              Follow {profile.username} to see their posts
            </div>
          ) : posts.length > 0 ? (
            posts.map((post, index) => (
              <div key={index} className="bg-[#222] rounded-2xl p-4 mb-6 shadow-lg">
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
                <div className="font-semibold mb-2">{post.description}</div>

                {/* IMAGE */}
                <div className="w-full h-72 bg-black rounded-xl overflow-hidden">
                  {post.image ? (
                    <img src={post.image} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="text-gray-400 py-10 text-center">No Image</div>
                  )}
                </div>

                {/* LIKE + COMMENT */}
                <div className="flex items-center mt-3 gap-6">
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => handleLike(post)}
                  >
                    <img src={Like} alt="" className="w-6 h-6" />
                    {post.likes.length}
                  </div>

                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => handleCommentClick(post._id)}
                  >
                    <img src={commentss} alt="" className="w-6 h-6" />
                    {post.comments.length}
                  </div>
                </div>

                {/* COMMENT INPUT */}
                {activePostId === post._id && (
                  <div className="mt-4 flex gap-2">
                    <input
                      placeholder="Write a comment..."
                      onChange={(e) => setComText({ text: e.target.value })}
                      className="flex-1 bg-[#333] px-3 py-2 rounded-lg border border-white/10"
                    />
                    <button
                      onClick={() => SubmitComment(post._id)}
                      className="bg-yellow-400 text-black px-4 py-2 rounded-lg"
                    >
                      Send
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-[#222] p-8 text-center rounded-2xl text-gray-300">
              {postMessage}
            </div>
          )}
        </div>

        {/* RIGHT COMMENT PANEL */}
        {fstatus === "Following" && (
          <div className="col-span-12 md:col-span-3">
            <div className="bg-[#222] rounded-2xl p-5 shadow-lg sticky top-24 h-fit">
              {!activePostId ? (
                <div className="text-gray-400 text-center">
                  Select a post to view comments
                </div>
              ) : (
                <>
                  <div className="text-lg font-semibold mb-3">
                    Comments on {profile.username}'s post
                  </div>

                  {com.length > 0 ? (
                    com.map((comment, idx) => (
                      <div key={idx} className="bg-[#1b1b1b] p-3 mb-3 rounded-xl">
                        <div className="font-semibold">{comusers.usernames[idx]}</div>
                        <div className="text-gray-300 mt-1">{comment.text}</div>

                        <button
                          className="mt-2 text-yellow-300 text-xs"
                          onClick={() => handleReplyClick(comment._id)}
                        >
                          Show replies
                        </button>

                        {visible === comment._id && (
                          <div className="mt-3 border-l-2 border-yellow-400 pl-3">
                            {replies.map((reply, i) => (
                              <p key={i} className="text-gray-300 text-sm">
                                <b>{replyusers.usernames[i]}</b>: {reply.text}
                              </p>
                            ))}
                          </div>
                        )}

                        <div className="mt-3 flex gap-2">
                          <input
                            ref={inputRef}
                            placeholder="Reply..."
                            className="bg-[#333] px-3 py-2 flex-1 rounded-lg border border-white/10"
                            onChange={(e) => setReplyText({ text: e.target.value })}
                          />

                          <button
                            className="bg-yellow-400 px-3 py-1 rounded-lg text-black"
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
