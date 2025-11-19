import React, { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Connect_Context from "../context/Connectcontext";
import Like from "../assets/like.svg";
import commentss from "../assets/comment.svg";
import Cookies from "js-cookie";

const Showcase = () => {
  const inputRef = useRef(null);

  const context = useContext(Connect_Context);
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

  const [visible, setvisible] = useState(null); // for replies
  const [replies, setreplies] = useState([]);

  const [followback, setfollowback] = useState([]);
  const [fpic, setfpic] = useState([]);

  // USER PROFILE DATA (Left Column)
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

    const replydata = await getreply(comment_id, authdata.authtoken);
    const useridarray = replydata.map((r) => r.userid);
    const usernames = await idtouser(useridarray);

    setreplies(replydata);
    setreplyusers(usernames);
    setvisible(comment_id);
  };

  // FETCH POSTS
  useEffect(() => {
    const fetchPosts = async () => {
      const fetchedPosts = await getallpost(authdata.authtoken);
      setposts(fetchedPosts);

      const useridarray = fetchedPosts.map((p) => p.userid);
      const usernames = await idtouser(useridarray);

      setusers(usernames);
    };
    fetchPosts();
  }, [authdata, getallpost, idtouser]);

  // FETCH FOLLOWING + FOLLOWBACK USERS
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
    <main className="min-h-screen bg-brandGrey pt-20 pb-8">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="grid grid-cols-12 gap-6">

          {/* LEFT PROFILE CARD */}
          <aside className="col-span-12 lg:col-span-3">
  <div className="space-y-6 sticky top-24">
    <div className="bg-[#282828] rounded-xl p-6 shadow-card">
      <div className="flex flex-col items-center gap-4">
        <div className="w-28 h-28 rounded-full ring-4 ring-brandYellow overflow-hidden">
          <img
            src="https://i.pravatar.cc/300"
            alt="profile"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex items-center gap-10 mt-2">
          <div className="text-center">
            <div className="text-sm text-white font-bold">{profile.followers}</div>
            <div className="text-xs text-gray-300 font-semibold">Followers</div>
          </div>

          <div className="text-center">
            <div className="text-sm text-white font-bold">{profile.following}</div>
            <div className="text-xs text-gray-300 font-semibold">Following</div>
          </div>
        </div>

        <div className="text-xl text-white font-bold mt-1">
          {profile.username}
        </div>

        <div className="text-sm text-white font-semibold">
          {profile.bio || "No bio available"}
        </div>

        <Link to={`/profile/${authdata.userid}`} className="w-full">
          <div className="mt-4 bg-gradient-to-b from-[#3a3a3a] to-[#222] text-center text-white font-bold py-2 rounded-full">
            My Profile
          </div>
        </Link>
      </div>
    </div>

    {/* SKILLS */}
    <div className="bg-[#282828] rounded-xl p-4 shadow-card">
      <div className="text-lg text-white font-bold mb-3">Skills</div>

      <div className="grid grid-cols-1 gap-3">
        {profile.skills.length > 0 ? (
          profile.skills.map((s, idx) => (
            <div
              key={idx}
              className="inline-block bg-[#333333] rounded-md px-3 py-1 text-lg text-white font-semibold"
            >
              {s}
            </div>
          ))
        ) : (
          <div className="inline-block bg-[#333333] rounded-md px-3 py-2 text-white font-semibold">
            No skills found
          </div>
        )}
      </div>
    </div>
  </div>
</aside>


          {/* CENTER FEED */}
          <section className="col-span-12 lg:col-span-6">
            <div className="flex items-center gap-4 mb-4">
              {fpic.length > 0 ? (
                fpic.map((f, i) => (
                  <div key={i} className="w-12 h-12 rounded-full ring-2 ring-brandYellow overflow-hidden">
                    <img
                      src="https://i.pravatar.cc/300"
                      alt="follow"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-sm">No followers</div>
              )}
            </div>

            <div className="space-y-6">
              {posts.map((post, index) => (
                <article key={post._id || index} className="bg-[#282828] rounded-xl p-6 shadow-card">

                  {/* Post Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img
                        src="https://i.pravatar.cc/300"
                        alt="profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="font-semibold text-white">
                      {users.usernames[index] || "unknown"}
                    </div>
                  </div>

                  <div className="text-gray-200 mb-4">{post.description}</div>

                  {post.image && (
                    <div className="mb-4">
                      <img
                        src={post.image}
                        alt="post"
                        className="w-full rounded-lg border border-black/40 object-contain max-h-[66vh]"
                      />
                    </div>
                  )}

                  {/* Like + Comment Button */}
                  <div className="flex items-center gap-6 text-sm text-gray-200 mb-4">
                    <div className="flex items-center gap-2">
                      <button onClick={async () => await handlelike(post)}>
                        <img src={Like} alt="like" className="w-5 h-5" />
                      </button>
                      <div>{post.likes.length}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCommentClick(post._id)}
                        className="flex items-center gap-2"
                      >
                        <img src={commentss} alt="comments" className="w-5 h-5" />
                        <span>
                          {activePostId === post._id ? "Hide Comments" : "Show Comments"}{" "}
                          {post.comments.length}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* COMMENT INPUT */}
                  <div className="flex items-center gap-3">
                    <input
                      ref={inputRef}
                      placeholder="Write a comment"
                      onChange={(e) => setcomtext({ text: e.target.value })}
                      className="flex-1 bg-[#1A1A1A] rounded-full py-3 px-4 text-white border border-[#444]"
                    />
                    <button
                      onClick={() => SubmitComment(post._id)}
                      className="bg-brandYellow text-black px-4 py-2 rounded-full font-semibold"
                    >
                      Send
                    </button>
                  </div>

                  {/* --------------------------- */}
                  {/*         COMMENTS UI         */}
                  {/* --------------------------- */}
                  {activePostId === post._id && (
                    <div className="mt-4 space-y-4 border-t border-[#444] pt-4">
                      {com.length > 0 ? (
                        com.map((c, idx) => (
                          <div key={idx} className="bg-[#1a1a1a] p-3 rounded-lg">
                            <div className="flex items-center gap-3">
                              <img
                                src="https://i.pravatar.cc/150?img=12"
                                className="w-8 h-8 rounded-full"
                                alt="comment user"
                              />
                              <div className="font-semibold text-gray-300">
                                {comusers.usernames[idx] || "user"}
                              </div>
                            </div>

                            <div className="text-gray-400 ml-11 mt-1">{c.text}</div>

                            {/* Reply button */}
                            <button
                              onClick={() => handlereply(c._id)}
                              className="ml-11 text-sm text-brandYellow"
                            >
                              {visible === c._id ? "Hide Replies" : "Show Replies"}
                            </button>

                            {/* Reply input */}
                            {visible === c._id && (
                              <div className="ml-11 mt-2 flex gap-2">
                                <input
                                  placeholder="Reply..."
                                  onChange={(e) =>
                                    setreplytext({ text: e.target.value })
                                  }
                                  className="flex-1 bg-[#111] rounded-full py-2 px-3 text-white border border-[#333]"
                                />
                                <button
                                  onClick={() => Submitreply(c._id)}
                                  className="bg-brandYellow text-black px-4 py-1 rounded-full"
                                >
                                  Send
                                </button>
                              </div>
                            )}

                            {/* Replies list */}
                            {visible === c._id && replies.length > 0 && (
                              <div className="ml-11 mt-3 space-y-3">
                                {replies.map((r, ridx) => (
                                  <div key={ridx} className="flex items-start gap-3">
                                    <img
                                      src="https://i.pravatar.cc/150?img=20"
                                      className="w-7 h-7 rounded-full"
                                      alt="reply user"
                                    />
                                    <div>
                                      <div className="font-semibold text-gray-300">
                                        {replyusers.usernames[ridx] || "user"}
                                      </div>
                                      <div className="text-gray-400">{r.text}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 text-sm">No comments yet.</div>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>

          {/* RIGHT COLUMN */}
          <aside className="col-span-12 lg:col-span-3">
            <div className="bg-[#282828] rounded-xl p-4 shadow-card sticky top-20">
              <div className="font-semibold mb-3 text-gray-400">
                Accounts You don't follow back
              </div>

              <div className="space-y-4 max-h-[62vh] overflow-auto pr-2">
                {followback.length > 0 ? (
                  followback.map((f, idx) => (
                    <div
                      key={idx}
                      className="bg-[#1f1f1f] rounded-lg p-3 flex items-center gap-3"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-brandYellow">
                        <img
                          src="https://i.pravatar.cc/300"
                          alt="rec"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="font-semibold text-white">{f.username}</div>
                        <div className="text-sm text-brandYellow">Follows you</div>
                      </div>

                      <div className="flex flex-col gap-2 w-36">
                        <button className="bg-[#333] text-white rounded-md py-2">
                          Remove
                        </button>
                        <button className="bg-brandYellow text-black rounded-md py-2">
                          Follow Back
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-sm">There are no such accounts</div>
                )}
              </div>
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
};

export default Showcase;
