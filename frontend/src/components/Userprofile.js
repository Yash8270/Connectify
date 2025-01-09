import React, { useContext, useEffect, useRef, useState } from 'react';
import '../css_file/Profile.css';
import profilepick from '../assets/profilepick.jpg';
import Connect_Context from '../context/Connectcontext';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const Userprofile = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const fid = useParams();
    const [profile,setprofile] = useState('');
    const [posts, setposts] = useState([]);
    const [com, setcom] = useState([]);
    const [comusers, setcomusers] = useState({ usernames: [] });
    const [replyusers, setreplyusers] = useState({usernames: []});
    const [like, setlike] = useState(false);
    const [activePostId, setActivePostId] = useState(null); 
    const [comid, setcomid] = useState('');
    const [visible, setvisible] = useState(null);
    const [replies, setreplies] = useState([]);
    const [replytext, setreplytext] = useState({text:''});
    const [postmssg, setpostmssg] = useState('No Post');
    const [fstatus, setfstatus] = useState('Follow');

    const context = useContext(Connect_Context);
    const { authdata, searchuser, idtouser, likepost, dislikepost, getcom, getreply,
        postreply, followname, setfollowname, followpost, frequest, reqstatus, unfuser } = context;
    console.log(authdata);

   const inputRef = useRef(null);

    const handleClear = () => {
        if(inputRef.current) {
            inputRef.current.value='';
        }
    } 

    const Submitreply = async (comment_id) => {
        const userreply = await postreply(comment_id, authdata.authtoken, replytext.text);
        console.log("User reply: ",userreply);
        const allreply = await getreply(comment_id, authdata.authtoken);
        const useridarray = allreply.map(reply => reply.userid);
        const usernames = await idtouser(useridarray);
        setreplyusers(usernames);
        setreplies(allreply);
 
        const allpost = await followpost(followname);
        setposts(allpost);
        setvisible(comment_id);
        setreplytext({text:''});
        handleClear();
    }

    const handleCommentClick = async (postId) => {
        if (activePostId === postId) {
            setActivePostId(null);
        } else {
            setActivePostId(postId);

            try {
                const compost = await getcom(postId, authdata.authtoken);
                const useridarray = compost.map(comment => comment.userid);
                console.log(useridarray);
                const usernames = await idtouser(useridarray);
                console.log(usernames);
                setcomusers(usernames);
                setcom(compost);
                setcomid(postId);
            } catch (error) {
                console.error("Error fetching comments:", error);
            }
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
            const updatedpost = await followpost(followname);
            setposts(updatedpost);
        } catch (error) {
            console.error("Error updating likes:", error);
        }
    }


    const handlereply = async (comment_id) => {
        if(visible === comment_id) {
            setvisible(null);
        }
        else {
            const replydata = await getreply(comment_id, authdata.authtoken);
            // console.log(replydata);
            const useridarray = replydata.map(reply => reply.userid);
            const usernames = await idtouser(useridarray);
            console.log(usernames);
            setreplyusers(usernames);
            setreplies(replydata);
            setvisible(comment_id);
        }
       
    }


    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const fetchedPosts = await followpost(followname);
                if(fetchedPosts.message) {
                    setpostmssg(fetchedPosts.message);
                }
                else {
                    setposts(fetchedPosts);
                    setpostmssg('No Post');
                }

                // const useridarray = [authdata.userid];
                // console.log("Users: ",useridarray);
                // const usernames = await idtouser(useridarray);
                setprofile(followname);

            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        };

        fetchPosts();
    }, [fid,authdata]);

    useEffect(() => {
        const RequestStatus = async () => {
            const data = await reqstatus(fid.userid);
           
          if(data.message) {
             setfstatus('Follow');
          } 
          else {
            if(data.followRequests[0].status === 'pending') {
                setfstatus('Requested');
               }
               else if(data.followRequests[0].status === 'accepted') {
                setfstatus('Following');
               }
               else {
                setfstatus('Follow');
               }
          } 
           
            
        }

        RequestStatus();
    },[fid]);

    const handlerequest = async (name) => {

       if(fstatus !== 'Following') {
        const request_data = await frequest(name);
        if(request_data.message) {
            alert(`${request_data.message}`);
            return;
        }
        setfstatus('Requested');
        alert('Request sent');
        console.log(request_data);
       } 

       else {
        const unfollow_data = await unfuser(fid.userid);
        setfstatus('Follow');
       }
       
    }

    const handlemessage = () => {
        // setcurrentChat(profile);
        // setid(fid.userid);
        navigate(`/chat/${authdata.userid}`, {state: {followid: fid.userid, chats: profile}});
    }
    

    return(
        <>
        <div className='profile-container'>
          <div className='profile-detail'>
            <div className='profile-image'>
                <img  id='profileimg' src={profilepick} alt='profile-pick'></img>
            </div>
            <div className='profile-data'>
                <div className='profile-user'>{profile}</div>
                <div className='bio'>Passionate Web developer</div>
            </div>
            <div className='connection'>
            <button id='followbtn' onClick={async () => await handlerequest(profile)}>{fstatus}</button>
            <button id='message' onClick={handlemessage}>Message</button>
          </div>  

          {posts.length > 0 ? (posts.map((post, index) => (
        <div className='profile-total-post' key={index}>
        <div className='post-description'>{post.description || 'Anonymous'}</div>
        <div className="post-picks">
            {post.image ? (
                <img id="postimg" src={post.image} alt="post" />
            ) : (
                <p>No Post</p>
            )}
        </div>          
        <div className="icon">
                            <div className="heart">
                                ❤️ <button id="likebtn" onClick={async () => await handlelike(post)}>Like</button>
                                {post.likes.length}
                            </div>
                            <div className="comment">
                                💬 
                                <button onClick={async () => await handleCommentClick(post._id)}>
                                    {activePostId === post._id ? 'Hide Comments' : 'Show Comments'}
                                </button>
                                {post.comments.length}
                            </div>
                        </div>
    </div>   
))):(
    <div className='profile-total-post'>
        <div className='post-descirption'>{postmssg}</div>
    </div>
)}
          </div>
          <div className='profile-comment-section'>


          {activePostId ? (
                    <>
                        <div className="profile-comment-head">
                            Comments on {profile}'s post
                        </div>
                        <div className="profile-comment-detail">
                            {com.length > 0 ? (
                                com.map((comment, idx) => (
                                    <div className="profile-comment" key={idx}>
                                        <div className="profile-top-profile">{comusers.usernames[idx] || 'Anonymous'}
                                            <button id='reply-visible' onClick={ async () => await handlereply(comment._id)}>replies</button>
                                        </div>
                                        <div className="profile-mssg">{comment.text}</div>

                                        {visible === comment._id && (
                              <div className="reply-container">
                                <div className="reply-declare">Replies:</div>
                                {replies.length > 0 ? (
                                    replies.map((reply, index) => (
                                        <div key={index} className="reply-detail">
                                            <div className="reply-head">{replyusers.usernames[index]}</div>
                                            <div className="reply-mssg">{reply.text}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="reply-empty">No replies yet</div>
                                )}
                            </div>
                        )}

                                        <div className="comment-reply">
                                            Like
                                            <input id="reply" placeholder="reply" ref={inputRef} onChange={(e) => setreplytext({...replytext, text: e.target.value})}></input>
                                            <button id="replybtn" onClick={async () => await Submitreply(comment._id)}>reply</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className='comment-detail'>No comments yet</div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="comment-detail">
                        <div>Now you have hidden the comments</div>
                    </div>
                )}
            </div>
        </div>
        </>
    );
}

export default Userprofile;