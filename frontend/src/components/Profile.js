import React, { useContext, useEffect, useRef, useState } from "react";
import Connect_Context from "../context/Connectcontext";
import Cookies from "js-cookie";
import Like from "../assets/like.svg";
import commentss from "../assets/comment.svg";

const Profile = () => {
  // USER PROFILE DATA (from cookies)
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
  const [like, setlike] = useState(false);
  const [activePostId, setActivePostId] = useState(null);
  const [visible, setvisible] = useState(null);
  const [replies, setreplies] = useState([]);
  const [replytext, setreplytext] = useState({ text: "" });
  const [comtext, setcomtext] = useState({ text: "" });

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

  // ⭐ LOAD USER PROFILE FROM COOKIES
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

  // ⭐ SUBMIT COMMENT
  const SubmitComment = async (postId) => {
    await postcom(postId, authdata.authtoken, comtext.text);

    const allcom = await getcom(postId, authdata.authtoken);
    const useridarray = allcom.map((c) => c.userid);
    const usernames = await idtouser(useridarray);

    setcom(allcom);
    setcomusers(usernames);

    // Update posts
    const updated = await selfpost(authdata.authtoken);
    setposts(updated);

    setcomtext({ text: "" });
    handleClear();
  };

  // ⭐ SUBMIT REPLY
  const Submitreply = async (comment_id) => {
    await postreply(comment_id, authdata.authtoken, replytext.text);

    const allreply = await getreply(comment_id, authdata.authtoken);
    const useridarray = allreply.map((r) => r.userid);
    const usernames = await idtouser(useridarray);

    setreplyusers(usernames);
    setreplies(allreply);

    const updated = await selfpost(authdata.authtoken);
    setposts(updated);

    setvisible(comment_id);
    setreplytext({ text: "" });
    handleClear();
  };

  // ⭐ SHOW COMMENTS FOR POST
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

  // ⭐ LIKE / DISLIKE POST
  const handlelike = async (post) => {
    if (like) {
      await dislikepost(post._id, authdata.authtoken);
      setlike(false);
    } else {
      await likepost(post._id, authdata.authtoken);
      setlike(true);
    }

    const updated = await selfpost(authdata.authtoken);
    setposts(updated);
  };

  // ⭐ SHOW REPLIES UNDER A COMMENT
  const handlereply = async (comment_id) => {
    if (visible === comment_id) return setvisible(null);

    const replydata = await getreply(comment_id, authdata.authtoken);
    const useridarray = replydata.map((r) => r.userid);
    const usernames = await idtouser(useridarray);

    setreplyusers(usernames);
    setreplies(replydata);
    setvisible(comment_id);
  };

  // ⭐ LOAD POSTS ON PAGE LOAD
  useEffect(() => {
    const fetchPosts = async () => {
      const fetchedPosts = await selfpost(authdata.authtoken);
      setposts(fetchedPosts);

      // const useridarray = [authdata.userid];
      // const usernames = await idtouser(useridarray);

      // setprofile(usernames);
    };
    fetchPosts();
  }, [authdata]);

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

              <button className="mt-4 bg-yellow-400 text-black px-5 py-2 rounded-lg font-semibold hover:bg-yellow-300">
                Edit Profile
              </button>
            </div>

            {/* Stats */}
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

            {/* Skills */}
            <div className="mt-6">
              <div className="text-lg font-semibold mb-2">Skills</div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.length > 0 ? (
                  profile.skills.map((s, idx) => (
                    <span key={idx} className="bg-[#333] px-3 py-1 rounded-md text-sm">
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
            posts.map((post, index) => (
              <div key={index} className="bg-[#222] rounded-2xl p-4 mb-6 shadow-lg">

                {/* USER INFO ON POST */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-yellow-400">
                    <img
                      // src={profile.profilepic}
                      src = "https://i.pravatar.cc/300"
                      alt="mypic"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-lg font-semibold">{profile.username}</div>
                </div>

                {/* DESCRIPTION */}
                <div className="font-semibold mb-2">{post.description}</div>

                {/* IMAGE */}
                <div className="w-full h-72 rounded-xl overflow-hidden bg-black">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt="post"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center py-10 text-gray-400">
                      No image available
                    </div>
                  )}
                </div>

                {/* LIKE + COMMENT */}
                <div className="flex items-center mt-3 gap-6">
                  <div className="flex items-center gap-2 cursor-pointer">
                    <img
                      src={Like}
                      alt="like"
                      className="w-6 h-6 cursor-pointer"
                      onClick={async () => await handlelike(post)}
                    />
                    {post.likes.length}
                  </div>

                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => handleCommentClick(post._id)}
                  >
                    <img src={commentss} className="w-6 h-6" alt="comments" />
                    {post.comments.length}
                  </div>
                </div>

                {/* COMMENT INPUT */}
                {activePostId === post._id && (
                  <div className="mt-4 flex gap-2 comment-input-animate">
                    <input
                      placeholder="Write a comment..."
                      onChange={(e) => setcomtext({ text: e.target.value })}
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
            <div className="text-center text-gray-400 mt-10 bg-[#222] py-10 rounded-2xl">
              No Posts Yet
            </div>
          )}
        </div>

        {/* RIGHT COMMENT PANEL */}
        <div className="col-span-12 md:col-span-3">
          <div className="bg-[#222] rounded-2xl p-5 shadow-lg sticky top-24 h-fit comment-panel-animate">

            {!activePostId ? (
              <div className="text-gray-400 text-center">
                Select a post to view comments
              </div>
            ) : (
              <div>
               <div className="comment-panel-animate">
                <div className="text-lg font-semibold mb-3">
                  Comments on {profile.username}'s post
                </div>
                </div>

                {com.length > 0 ? (
                  <div className="space-y-4">
                    {com.map((comment, idx) => (
                      <div key={idx} className="bg-[#1b1b1b] p-3 rounded-xl comment-card-animate">

                        <div className="font-semibold">
                          {comusers.usernames[idx]}
                          <button
                            className="ml-3 text-yellow-300 text-xs"
                            onClick={() => handlereply(comment._id)}
                          >
                            replies
                          </button>
                        </div>

                        <div className="text-gray-300 mt-1">{comment.text}</div>

                        {/* Replies */}
                        {visible === comment._id && (
                          <div className="mt-3 pl-3 border-l-2 border-yellow-400">
                            {replies.length > 0 ? (
                              replies.map((reply, index) => (
                                <div key={index} className="text-sm text-gray-300 mb-2 reply-item-animate">
                                  <span className="font-semibold">
                                    {replyusers.usernames[index]}:
                                  </span>{" "}
                                  {reply.text}
                                </div>
                              ))
                            ) : (
                              <div className="text-gray-500 text-sm">No replies</div>
                            )}
                          </div>
                        )}

                        {/* Reply input */}
                        <div className="mt-3 flex gap-2">
                          <input
                            ref={inputRef}
                            placeholder="Reply..."
                            className="flex-1 bg-[#333] px-3 py-2 rounded-lg outline-none border border-white/10"
                            onChange={(e) => setreplytext({ text: e.target.value })}
                          />
                          <button
                            className="bg-yellow-400 text-black px-3 py-1 rounded-lg"
                            onClick={() => Submitreply(comment._id)}
                          >
                            Send
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400">No comments yet</div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
