import React, { useContext, useEffect, useRef, useState } from "react";
import Connect_Context from "../context/Connectcontext";
import Cookies from "js-cookie";
import Like from "../assets/like.svg";
import commentss from "../assets/comment.svg";

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

  const context = useContext(Connect_Context);
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

    await postcom(postId, authdata.authtoken, comtext.text);

    const allcom = await getcom(postId, authdata.authtoken);
    const useridarray = allcom.map((c) => c.userid);
    const usernames = await idtouser(useridarray);

    setcom(allcom);
    setcomusers(usernames);

    const updated = await selfpost(authdata.authtoken);
    setposts(updated);

    setcomtext({ text: "" });
  };

  const Submitreply = async (comment_id) => {
    if (!replytext.text.trim()) return;

    await postreply(comment_id, authdata.authtoken, replytext.text);

    const replydata = await getreply(comment_id, authdata.authtoken);
    const ids = replydata.map((r) => r.userid);
    const usernames = await idtouser(ids);

    setreplyusers(usernames);
    setreplies(replydata);

    const updated = await selfpost(authdata.authtoken);
    setposts(updated);

    setvisible(comment_id);
    setreplytext({ text: "" });
    handleClear();
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
    if (post.likes.includes(authdata.userid)) {
      await dislikepost(post._id, authdata.authtoken);
    } else {
      await likepost(post._id, authdata.authtoken);
    }

    const updated = await selfpost(authdata.authtoken);
    setposts(updated);
  };

  const handlereply = async (comment_id) => {
    if (visible === comment_id) return setvisible(null);

    const replydata = await getreply(comment_id, authdata.authtoken);
    const ids = replydata.map((r) => r.userid);
    const usernames = await idtouser(ids);

    setreplyusers(usernames);
    setreplies(replydata);
    setvisible(comment_id);
  };

  useEffect(() => {
    const load = async () => {
      const fetched = await selfpost(authdata.authtoken);
      setposts(fetched);
    };
    load();
  }, [authdata]);

  return (
    // UPDATED: Added -mt-20 to pull bg up behind navbar spacer, and pt-20 to push content down
    <div className="min-h-screen bg-[#0f0f0f] text-white -mt-20 pt-20">
      
      <div className="grid grid-cols-12 gap-6 max-w-[1600px] mx-auto px-4 md:px-10 pb-10">

        {/* LEFT PROFILE */}
        <div className="col-span-12 md:col-span-3">
          <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/10 sticky top-0">

            <div className="flex flex-col items-center">
              <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-yellow-400">
                <img src="https://i.pravatar.cc/300" className="w-full h-full object-cover" />
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
            posts.map((post) => (
              <div key={post._id} className="bg-[#1a1a1a] rounded-2xl p-4 mb-6 border border-white/10">

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-yellow-400">
                    <img src="https://i.pravatar.cc/300" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-lg font-semibold">{profile.username}</div>
                </div>

                <div className="font-semibold mb-2">{post.description}</div>

                {post.image && (
                  <div className="w-full h-72 rounded-xl overflow-hidden bg-black">
                    <img src={post.image} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex items-center mt-3 gap-6">
                  <div className="flex items-center gap-2 cursor-pointer">
                    <img src={Like} className="w-6 h-6" onClick={() => handlelike(post)} />
                    {post.likes.length}
                  </div>

                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleCommentClick(post._id)}>
                    <img src={commentss} className="w-6 h-6" />
                    {post.comments.length}
                  </div>
                </div>

                {activePostId === post._id && (
                  <div className="mt-4 flex gap-2">
                    <input
                      placeholder="Write a comment..."
                      onChange={(e) => setcomtext({ text: e.target.value })}
                      className="flex-1 bg-[#111] px-3 py-2 rounded-lg border border-white/10"
                    />
                    <button
                      onClick={() => SubmitComment(post._id)}
                      className="bg-yellow-400 text-black px-4 py-2 rounded-lg"
                    >
                      Send
                    </button>
                  </div>
                )}

                {/* MOBILE COMMENTS */}
                {isMobile && activePostId === post._id && (
                  <div className="mt-5 bg-[#111] p-4 rounded-xl">

                    {com.length === 0 && (
                      <div className="text-gray-400 text-center">No comments yet</div>
                    )}

                    {com.map((c, idx) => (
                      <div key={c._id} className="mb-4 bg-[#1a1a1a] p-3 rounded-lg">

                        <div className="font-semibold">{comusers.usernames[idx]}</div>
                        <div className="text-gray-300 mt-1">{c.text}</div>

                        <div className="mt-3 pl-3 border-l-2 border-yellow-400">
                          {visible === c._id &&
                            replies.map((r, i) => (
                              <div key={i} className="text-sm text-gray-300 mb-2">
                                <span className="font-semibold">
                                  {replyusers.usernames[i]}:
                                </span>{" "}
                                {r.text}
                              </div>
                            ))}

                          <button
                            className="text-yellow-300 text-xs mt-1"
                            onClick={() => handlereply(c._id)}
                          >
                            {visible === c._id ? "Hide replies" : "View replies"}
                          </button>
                        </div>

                        <div className="mt-3 flex gap-2">
                          <input
                            ref={inputRef}
                            placeholder="Reply..."
                            className="flex-1 bg-[#111] px-3 py-2 rounded-lg border border-white/10"
                            onChange={(e) =>
                              setreplytext({ text: e.target.value })
                            }
                          />
                          <button
                            className="bg-yellow-400 text-black px-3 py-1 rounded-lg"
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
            ))
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
                  <div className="text-lg font-semibold mb-4">
                    Comments on {profile.username}'s post
                  </div>

                  {com.length > 0 ? (
                    com.map((comment, idx) => (
                      <div key={comment._id} className="bg-[#111] p-3 rounded-xl mb-3">
                        <div className="font-semibold">
                          {comusers.usernames[idx]}
                          <button
                            className="ml-3 text-yellow-300 text-xs"
                            onClick={() => handlereply(comment._id)}
                          >
                            replies
                          </button>
                        </div>

                        <div className="text-gray-300">{comment.text}</div>

                        {visible === comment._id && (
                          <div className="mt-2 pl-3 border-l border-yellow-400">
                            {replies.length > 0 ? (
                              replies.map((r, i) => (
                                <div key={i} className="text-sm text-gray-300">
                                  <span className="font-semibold">
                                    {replyusers.usernames[i]}:
                                  </span>{" "}
                                  {r.text}
                                </div>
                              ))
                            ) : (
                              <div className="text-gray-500 text-sm">No replies</div>
                            )}
                          </div>
                        )}

                        <div className="mt-2 flex gap-2">
                          <input
                            ref={inputRef}
                            placeholder="Reply..."
                            className="flex-1 bg-[#111] px-3 py-2 rounded-lg border border-white/10"
                            onChange={(e) =>
                              setreplytext({ text: e.target.value })
                            }
                          />
                          <button
                            className="bg-yellow-400 text-black px-3 py-1 rounded-lg"
                            onClick={() => Submitreply(comment._id)}
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

export default Profile;