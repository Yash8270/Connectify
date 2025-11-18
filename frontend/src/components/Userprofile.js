import React, { useContext, useEffect, useRef, useState } from "react";
import Connect_Context from "../context/Connectcontext";
import { useNavigate, useParams } from "react-router-dom";

const Userprofile = () => {
  const navigate = useNavigate();
  const fid = useParams();

  const [profile, setprofile] = useState(""); // real username to display
  const [posts, setposts] = useState([]);
  const [com, setcom] = useState([]);
  const [comusers, setcomusers] = useState({ usernames: [] });
  const [replyusers, setreplyusers] = useState({ usernames: [] });
  const [like, setlike] = useState(false);
  const [activePostId, setActivePostId] = useState(null);
  const [visible, setvisible] = useState(null);
  const [replies, setreplies] = useState([]);
  const [replytext, setreplytext] = useState({ text: "" });
  const [postmssg, setpostmssg] = useState("No Post");
  const [fstatus, setfstatus] = useState("Follow");

  const context = useContext(Connect_Context);

  const {
    authdata,
    idtouser,
    likepost,
    dislikepost,
    getcom,
    getreply,
    postreply,
    followname,
    setfollowname,
    followpost,
    frequest,
    reqstatus,
    unfuser,
  } = context;

  const inputRef = useRef(null);

  const handleClear = () => {
    if (inputRef.current) inputRef.current.value = "";
  };

  const Submitreply = async (comment_id) => {
    await postreply(comment_id, authdata.authtoken, replytext.text);
    const allreply = await getreply(comment_id, authdata.authtoken);

    const useridarray = allreply.map((r) => r.userid);
    const usernames = await idtouser(useridarray);

    setreplyusers(usernames);
    setreplies(allreply);

    const updatedPosts = await followpost(followname);
    setposts(updatedPosts);

    setvisible(comment_id);
    setreplytext({ text: "" });
    handleClear();
  };

  const handleCommentClick = async (postId) => {
    if (activePostId === postId) {
      setActivePostId(null);
    } else {
      setActivePostId(postId);

      const compost = await getcom(postId, authdata.authtoken);
      const useridarray = compost.map((c) => c.userid);
      const usernames = await idtouser(useridarray);

      setcomusers(usernames);
      setcom(compost);
    }
  };

  const handlelike = async (post) => {
    if (like) {
      await dislikepost(post._id, authdata.authtoken);
      setlike(false);
    } else {
      await likepost(post._id, authdata.authtoken);
      setlike(true);
    }
    const updated = await followpost(followname);
    setposts(updated);
  };

  const handlereply = async (comment_id) => {
    if (visible === comment_id) {
      setvisible(null);
    } else {
      const replydata = await getreply(comment_id, authdata.authtoken);
      const useridarray = replydata.map((r) => r.userid);
      const usernames = await idtouser(useridarray);

      setreplyusers(usernames);
      setreplies(replydata);
      setvisible(comment_id);
    }
  };

  /** 🔥 FIXED: Use followname as the REAL username */
  useEffect(() => {
    const fetchPosts = async () => {
      setfollowname(fid.userid);

      const fetched = await followpost(fid.userid);

      if (fetched.message) setpostmssg(fetched.message);
      else setposts(fetched);

      /** FIXED: show username, not userid */
      setprofile(followname);
    };

    fetchPosts();
  }, [fid, authdata, followname]);

  useEffect(() => {
    const fetchStatus = async () => {
      const data = await reqstatus(fid.userid);

      if (data.message) setfstatus("Follow");
      else {
        const stat = data.followRequests[0].status;
        if (stat === "pending") setfstatus("Requested");
        else if (stat === "accepted") setfstatus("Following");
        else setfstatus("Follow");
      }
    };
    fetchStatus();
  }, [fid]);

  const handlerequest = async (name) => {
    if (fstatus !== "Following") {
      const r = await frequest(name);
      if (r.message) return alert(r.message);

      setfstatus("Requested");
      alert("Request sent");
    } else {
      await unfuser(fid.userid);
      setfstatus("Follow");
    }
  };

  const handlemessage = () => {
    navigate(`/chat/${authdata.userid}`, {
      state: { followid: fid.userid, chats: profile },
    });
  };

  return (
    <div className="min-h-screen bg-[#151515] pt-24 px-4 md:px-10 pb-10 text-white">
      <div className="grid grid-cols-12 gap-6 max-w-[1600px] mx-auto">

        {/* LEFT PROFILE CARD */}
        <div className="col-span-12 md:col-span-3">
          <div className="bg-[#222] p-6 rounded-2xl shadow-lg sticky top-24">
            <div className="flex flex-col items-center">

              {/* Profile Image */}
              <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-yellow-400">
                <img
                  src="https://i.pravatar.cc/300"
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* FIXED: Username visible below pic */}
              <div className="mt-4 text-2xl font-semibold">
                {profile || followname || "User"}
              </div>

              <div className="text-gray-400 text-sm mt-1">
                Passionate Web Developer
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-4 w-full">
                <button
                  className={`flex-1 py-2 rounded-full font-semibold ${
                    fstatus === "Following"
                      ? "bg-gray-700 border border-white/20"
                      : "bg-yellow-400 text-black"
                  }`}
                  onClick={() => handlerequest(profile)}
                >
                  {fstatus}
                </button>

                <button
                  onClick={handlemessage}
                  className="py-2 px-4 rounded-full bg-[#333]"
                >
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER POSTS */}
        <div className="col-span-12 md:col-span-6">
          <h1 className="text-2xl mb-4 font-semibold">
            {(profile || followname || "User")}'s Posts
          </h1>

          {posts.length > 0 ? (
            posts.map((post, index) => (
              <div
                key={index}
                className="bg-[#222] rounded-2xl p-4 mb-6 shadow-lg"
              >
                <div className="font-semibold mb-2">{post.description}</div>

                <div className="w-full h-72 bg-black rounded-xl overflow-hidden">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt="post"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center py-10 text-gray-400">
                      No Post
                    </div>
                  )}
                </div>

                <div className="flex items-center mt-3 gap-6">
                  <div className="flex items-center gap-2 cursor-pointer">
                    <span
                      onClick={() => handlelike(post)}
                      className="text-lg cursor-pointer"
                    >
                      ❤️
                    </span>
                    {post.likes.length}
                  </div>

                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => handleCommentClick(post._id)}
                  >
                    💬 {post.comments.length}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-[#222] text-center py-10 rounded-2xl text-gray-400">
              {postmssg}
            </div>
          )}
        </div>

        {/* RIGHT COMMENT PANEL */}
        <div className="col-span-12 md:col-span-3">
          <div className="bg-[#222] rounded-2xl p-5 shadow-lg sticky top-24 h-fit">

            {!activePostId ? (
              <div className="text-gray-400 text-center">
                Select a post to view comments
              </div>
            ) : (
              <>
                <div className="text-lg font-semibold mb-3">
                  Comments on {(profile || followname || "User")}'s post
                </div>

                {com.length > 0 ? (
                  com.map((comment, idx) => (
                    <div
                      key={idx}
                      className="bg-[#1b1b1b] p-3 rounded-xl mb-3"
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-semibold">
                          {comusers.usernames[idx]}
                        </div>

                        <button
                          className="text-yellow-300 text-xs"
                          onClick={() => handlereply(comment._id)}
                        >
                          replies
                        </button>
                      </div>

                      <div className="mt-1 text-gray-300">
                        {comment.text}
                      </div>

                      {visible === comment._id && (
                        <div className="mt-3 pl-3 border-l-2 border-yellow-400">
                          <div className="text-gray-400 text-sm">Replies:</div>

                          {replies.length > 0 ? (
                            replies.map((reply, ix) => (
                              <div
                                key={ix}
                                className="text-sm text-gray-300 mt-1"
                              >
                                <b>{replyusers.usernames[ix]}</b>:{" "}
                                {reply.text}
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-500 text-sm">
                              No replies
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex gap-2">
                        <input
                          ref={inputRef}
                          className="bg-[#333] flex-1 px-3 py-2 rounded-lg border border-white/10 outline-none"
                          placeholder="Reply..."
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

      </div>
    </div>
  );
};

export default Userprofile;
