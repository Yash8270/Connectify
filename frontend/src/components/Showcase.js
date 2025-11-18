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
  const [users, setusers] = useState({ usernames: [] });
  const [replyusers, setreplyusers] = useState({ usernames: [] });
  const [like, setlike] = useState(false);
  const [activePostId, setActivePostId] = useState(null);
  const [comtext, setcomtext] = useState({ text: "" });
  const [visible, setvisible] = useState(null);
  const [replies, setreplies] = useState([]);
  const [replytext, setreplytext] = useState({ text: "" });
  const [followback, setfollowback] = useState([]);
  const [fpic, setfpic] = useState([]);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    const userCookie = Cookies.get();
    if (userCookie && userCookie.skills)
      setSkills(userCookie.skills.split(",").map((s) => s.trim()));
  }, []);

  const handleClear = () => {
    if (inputRef.current) inputRef.current.value = "";
  };

  const SubmitComment = async (postId) => {
    await postcom(postId, authdata.authtoken, comtext.text);
    const allcom = await getcom(postId, authdata.authtoken);
    const useridarray = allcom.map((c) => c.userid);
    const usernames = await idtouser(useridarray);
    setcomusers(usernames);
    setcom(allcom);

    const allpost = await getallpost(authdata.authtoken);
    setposts(allpost);
    setcomtext({ text: "" });
    handleClear();
  };

  const Submitreply = async (comment_id) => {
    await postreply(comment_id, authdata.authtoken, replytext.text);
    const allreply = await getreply(comment_id, authdata.authtoken);
    const useridarray = allreply.map((r) => r.userid);
    const usernames = await idtouser(useridarray);
    setreplyusers(usernames);
    setreplies(allreply);

    const allpost = await getallpost(authdata.authtoken);
    setposts(allpost);
    setvisible(comment_id);
    setreplytext({ text: "" });
    handleClear();
  };

  const handleCommentClick = async (postId) => {
    if (activePostId === postId) {
      setActivePostId(null);
      setcom([]);
    } else {
      setActivePostId(postId);
      const compost = await getcom(postId, authdata.authtoken);
      const useridarray = compost.map((c) => c.userid);
      const usernames = await idtouser(useridarray);
      setcomusers(usernames);
      setcom(compost);
      setvisible(postId);
    }
  };

  const handlelike = async (post) => {
    try {
      if (like) {
        await dislikepost(post._id, authdata.authtoken);
        setlike(false);
      } else {
        await likepost(post._id, authdata.authtoken);
        setlike(true);
      }
      const updatedpost = await getallpost(authdata.authtoken);
      setposts(updatedpost);
    } catch (error) {
      console.error(error);
    }
  };

  const handlereply = async (comment_id) => {
    if (visible === comment_id) setvisible(null);
    else {
      const replydata = await getreply(comment_id, authdata.authtoken);
      const useridarray = replydata.map((r) => r.userid);
      const usernames = await idtouser(useridarray);
      setreplyusers(usernames);
      setreplies(replydata);
      setvisible(comment_id);
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const fetchedPosts = await getallpost(authdata.authtoken);
        setposts(fetchedPosts);
        const useridarray = fetchedPosts.map((p) => p.userid);
        const usernames = await idtouser(useridarray);
        setusers(usernames);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPosts();
  }, [authdata, getallpost, idtouser]);

  useEffect(() => {
    const fetchProfilePics = async () => {
      const following_pics = await profile_following();
      setfpic(following_pics);
      const dont_f_back = await only_followers();
      setfollowback(dont_f_back);
    };
    fetchProfilePics();
  }, [profile_following, only_followers]);

  return (
    <main className="min-h-screen bg-brandGrey pt-20 pb-8">
      <div className="max-w-[1600px] mx-auto px-6">
        {/* Grid: left, center (dominant), right */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left column (narrow) */}
          {/* Left column - STICKY PROFILE CARD */}
<aside className="col-span-12 lg:col-span-3">
  <div className="space-y-6 sticky top-24">
    {/* Profile Card */}
    <div className="bg-[#282828] rounded-xl p-6 shadow-card">
      <div className="flex flex-col items-center gap-4">
        <div className="w-28 h-28 rounded-full ring-4 ring-brandYellow overflow-hidden text-gray-400">
          <img
            src={Cookies.get("profile")}
            alt="profile"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="text-center">
          <div className="text-sm text-gray-300">3</div>
          <div className="text-xs text-gray-400">Followers</div>
        </div>

        <div className="text-center">
          <div className="text-sm text-gray-300">2</div>
          <div className="text-xs text-gray-400">Following</div>
        </div>

        <div className="text-xl text-gray-400 font-bold mt-1">Gojo</div>
        <div className="text-sm text-gray-400">User</div>

        <Link to={`/profile/${authdata.userid}`} className="w-full">
          <div className="mt-4 bg-gradient-to-b from-[#3a3a3a] to-[#222] text-center text-gray-400 py-2 rounded-full">
            My Profile
          </div>
        </Link>
      </div>
    </div>

    {/* Skills */}
    <div className="bg-[#282828] rounded-xl p-4 shadow-card">
      <div className="text-lg text-gray-400 font-semibold mb-3">Skills</div>
      <div className="grid grid-cols-1 gap-3">
        {skills.length > 0 ? (
          skills.map((s, idx) => (
            <div
              key={idx}
              className="inline-block bg-[#333333] rounded-md px-3 py-1 text-sm"
            >
              {s}
            </div>
          ))
        ) : (
          <div className="inline-block bg-[#333333] rounded-md px-3 py-2 text-sm text-gray-400">
            No skills found
          </div>
        )}
      </div>
    </div>
  </div>
</aside>


          {/* Center feed (dominant) */}
          <section className="col-span-12 lg:col-span-6">
            <div className="flex items-center gap-4 mb-4">
              {fpic.length > 0 ? (
                fpic.map((f, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full ring-2 ring-brandYellow overflow-hidden text-gray-400"
                  >
                    <img
                      src={f.profilepic}
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
                <article
                  key={post._id || index}
                  className="bg-[#282828] rounded-xl p-6 shadow-card"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img
                        src={post.profilepic}
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
                        id="postimg"
                        className="w-full rounded-lg border border-black/40 object-contain max-h-[66vh]"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-6 text-sm text-gray-200 mb-4">
                    <div className="flex items-center gap-2">
                      <button onClick={async () => await handlelike(post)}>
                        <img src={Like} alt="like" className="w-5 h-5" />
                      </button>
                      <div>{post.likes.length}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => await handleCommentClick(post._id)}
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

                  <div className="flex items-center gap-3">
                    <input
                      ref={inputRef}
                      placeholder="Write a comment"
                      onChange={(e) => setcomtext({ text: e.target.value })}
                      className="flex-1 bg-[#1A1A1A] rounded-full py-3 px-4 text-white border border-[#444]"
                    />
                    <button
                      onClick={async () => await SubmitComment(post._id)}
                      className="bg-brandYellow text-black px-4 py-2 rounded-full font-semibold"
                    >
                      Send
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Right column (narrow) */}
          <aside className="col-span-12 lg:col-span-3">
            <div className="bg-[#282828] rounded-xl p-4 shadow-card sticky top-20">
              <div className="font-semibold mb-3 text-gray-400">Accounts You don't follow back</div>

              <div className="space-y-4 max-h-[62vh] overflow-auto pr-2">
                {followback.length > 0 ? (
                  followback.map((f, idx) => (
                    <div
                      key={idx}
                      className="bg-[#1f1f1f] rounded-lg p-3 flex items-center gap-3"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-brandYellow text-gray-400">
                        <img
                          src={f.profilepic}
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
