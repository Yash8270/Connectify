import React, { useContext, useEffect, useRef, useState } from 'react';
import '../css_file/Profile.css';
import profilepick from '../assets/profilepick.jpg';
import interaction from '../assets/interaction.svg';
import Connect_Context from '../context/Connectcontext';
import Like from '../assets/like.svg';
import commentss from '../assets/comment.svg';
import activity_img from '../assets/activity.png';
import gojo from '../assets/gojo.jpg';

const Profile = () => {

    const [profile,setprofile] = useState({usernames: []});
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

    const context = useContext(Connect_Context);
    const { authdata, selfpost, idtouser, likepost, dislikepost, getcom, getreply,postreply } = context;
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
 
        const allpost = await selfpost(authdata.authtoken);
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
            const updatedpost = await selfpost(authdata.authtoken);
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
                const fetchedPosts = await selfpost(authdata.authtoken);
                setposts(fetchedPosts);

                const useridarray = [authdata.userid];
                console.log("Users: ",useridarray);
                const usernames = await idtouser(useridarray);
                setprofile(usernames);

            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        };

        fetchPosts();
    }, [authdata]);

    

    return(
        <>
        <div className='main-profile'>
        <div className='profile-container'>
          <div className='profile-detail'>
            <div className='profile-image'>
                <img  id='profileimg' src={gojo} alt='profile-pick'></img>
            </div>
                <div className='profile-user'>{profile.usernames[0]}</div>
                <div className='bio'>Passionate Web developer</div>
                <div className='edit'>Edit Profile</div>
            </div>  
            <div className='profile-depth'>
                <div className='activity'>Activity</div>
                <div className='graph'><img id="graphimg" src={activity_img} alt="graph"></img></div>
                <div className='profile-setting'>
                  <div className='setting-head'> My Profile Setting</div> 
                    <div className='setting-pass'>Password<input value="**********"></input></div> 
                    <div className='setting-mail'>E-mail<input value="jjk@gmail.com"></input></div>
                   </div>
                </div>  
               </div> 
       <div className='post-comment-flex'>        
       <div className='post-down-scroll'>         
                {posts.length > 0 ? (posts.map((post, index) => (
        <div className='profile-total-post' key={index}>
        <div className='post-description'>{post.description || 'Anonymous'}</div>
        <div className="post-picks">
            {post.image ? (
                <img id="postimg" src={post.image} alt="post" />
            ) : (
                <p>No image available</p>
            )}
        </div>          
       <div className="icon">
                                   <div className="heart">
                                       {/* <button id="likebtn" onClick={async () => await handlelike(post)}> */}
                                           <img src={Like} alt='Likes' onClick={async () => await handlelike(post)} ></img>
                                       {/* </button> */}
                                       {post.likes.length}
                                   </div>
                                   <div className="comment"> 
                                       {/* <button onClick={async () => await handleCommentClick(post._id)}> */}
                                       <img src={commentss} alt='Comments' onClick={async () => await handleCommentClick(post._id)}></img>
                                           {activePostId === post._id ? 'Hide Comments' : 'Show Comments'}
                                       {/* </button> */}
                                       {post.comments.length}
                                   </div>
                               </div>
    </div>   
))):(
    <div className='profile-total-post'>
        <div className='post-descirption'>No post</div>
    </div>
)}

</div>
          <div className='profile-comment-section'>


          {activePostId ? (
                    <>
                        <div className="profile-comment-head">
                            Comments on {profile.usernames[0]}'s post
                        </div>
                        <div className="profile-comment-detail">
                            {com.length > 0 ? (
                                com.map((comment, idx) => (
                                    <div className="profile-comment" key={idx}>
                                        <div className='profile-user-com-head'>
                                      <div className='compic'><img src={profilepick} alt='pick'></img> </div>
                                        <div className="profile-top-profile">{comusers.usernames[idx] || 'Anonymous'}
                                            <button id='reply-visible' onClick={ async () => await handlereply(comment._id)}>replies</button>
                                        </div>
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
    </div>
        </>
    );
}

export default Profile;