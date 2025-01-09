import React, { useContext, useEffect, useRef, useState } from 'react';
import {Link} from 'react-router-dom';
import '../css_file/Showcase.css';
import Connect_Context from '../context/Connectcontext';
import Like from '../assets/like.svg';
import commentss from '../assets/comment.svg';
import pic from '../assets/profilepick.jpg';
import Cookies from 'js-cookie';
import first from '../assets/first.jpg';
import second from '../assets/second.jpg';
import third from '../assets/third.jpg';
import fourth from '../assets/fourth.jpg';
import fifth from '../assets/fifth.jpg';
import sixth from '../assets/sixth.jpg';
import seventh from '../assets/seventh.jpg';
import eigth from '../assets/first.jpg';
import gojo from '../assets/gojo.jpg';

const Showcase = () => {

    const host = 'http://localhost:5000';

    const [posts, setposts] = useState([]);
    const [com, setcom] = useState([]);
    const [comusers, setcomusers] = useState({ usernames: [] });
    const [users, setusers] = useState({ usernames: [] });
    const [replyusers, setreplyusers] = useState({usernames: []});
    const [like, setlike] = useState(false);
    const [activePostId, setActivePostId] = useState(null); 
    const [comtext, setcomtext] = useState({text:''});
    const [comid, setcomid] = useState('');
    const [visible, setvisible] = useState(null);
    const [replies, setreplies] = useState([]);
    const [replytext, setreplytext] = useState({text:''});

    const context = useContext(Connect_Context);
    const {authdata, setauthdata, getallpost, idtouser, likepost, dislikepost, getcom, postcom, getreply,postreply } = context;
  
        const inputRef = useRef(null);

    const handleClear = () => {
        if(inputRef.current) {
            inputRef.current.value='';
        }
    } 

    const SubmitComment = async (postId) => {
      
        const usercom = await postcom(postId, authdata.authtoken, comtext.text);
        console.log("user comments: ",usercom);
        const allcom = await getcom(postId, authdata.authtoken);
        const useridarray = allcom.map(comment => comment.userid);
        console.log(useridarray);
        const usernames = await idtouser(useridarray);
        console.log(usernames);
        setcomusers(usernames);
        setcom(allcom);

        const allpost = await getallpost(authdata.authtoken);
        setposts(allpost);
        setcomtext({text:''});
        handleClear();
    }

    const Submitreply = async (comment_id) => {
        const userreply = await postreply(comment_id, authdata.authtoken, replytext.text);
        console.log("User reply: ",userreply);
        const allreply = await getreply(comment_id, authdata.authtoken);
        const useridarray = allreply.map(reply => reply.userid);
        const usernames = await idtouser(useridarray);
        setreplyusers(usernames);
        setreplies(allreply);
 
        const allpost = await getallpost(authdata.authtoken);
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
                // console.log(useridarray);
                const usernames = await idtouser(useridarray);
                // console.log(usernames);
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
            const updatedpost = await getallpost(authdata.authtoken);
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
            console.log(replydata);
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
                const fetchedPosts = await getallpost(authdata.authtoken);
                setposts(fetchedPosts);

                const useridarray = fetchedPosts.map(post => post.userid);
                const usernames = await idtouser(useridarray);

                setusers(usernames);
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        };

        fetchPosts();
        
    }, [authdata]);


      console.log(authdata);

    return (
        <div className="show">
           <div className='self-data'> 
            <div className="self-info">
                {/* <div className="recommendation-head">Mutual connection</div>
                <div className="recommend">
                    <div className="rec-user">Alice</div>
                    <div className="rec-user">Alice</div>
                    <div className="rec-user">Alice</div>
                    <div className="rec-user">Alice</div>
                    <div className="rec-user">Alice</div>
                    <div className="rec-user">Alice</div>
                    <div className="rec-user">Alice</div>
                    <div className="rec-user">Alice</div>
                    <div className="rec-user">Alice</div>
                    <div className="rec-user">Alice</div>
                </div> */}
                <div className='nfollower'>
                    <div><strong>{Cookies.get('followers')}</strong></div>
                    <div>Followers</div>
                </div>
                <div className='profileimg'>
                    <img id='pimg' src={gojo} alt='My Profile'></img>
                </div>
                <div className='nfollowing'>
                <div><strong>{Cookies.get('following')}</strong></div>
                    <div>Following</div>
                </div>
                <div className='username_profile'>{Cookies.get('username')}</div>
                <div className='bio'>Hello, I am Full Stack Developer</div>
                <div className='my-profile'><Link to={`/profile/${authdata.userid}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                My Profile</Link></div>
            </div>
             <div className='skills'>
                 <div className='skillhead'>Skills</div>
                 <div className='skill-detail'>
                    <div>MERN Stack Developer</div>
                    <div>Backend Developer</div>
                    <div>Robotics</div>
                    <div>Embedded C/C++</div>
                    <div>Machine Learning</div>
                 </div>
             </div>
            </div>
            <div className='post-data'>
                <div className='followings'>
               <div><img id='followimg' src={first} alt='Profile'></img></div>
               <div><img id='followimg' src={second} alt='Profile'></img></div>
               <div><img id='followimg' src={third} alt='Profile'></img></div>
               <div><img id='followimg' src={fourth} alt='Profile'></img></div>
               <div><img id='followimg' src={fifth} alt='Profile'></img></div>
                </div>
            <div className="posts">
                {posts.map((post, index) => (
                    <>
                    <div className="profile-post" key={index}>
                       <div className="image-user">
                        <div className="post-profile-img"><img src={seventh} alt="profilepic"></img></div>
                       <div className="profile-name">{users.usernames[index]}</div>
                       </div>
                        
                        <div className="post-detail">{post.description}</div>
                        <div className="post-image">
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
                                    {activePostId === post._id ? 'Hide Comments    ' : 'Show Comments    '}
                                {/* </button> */}
                                {post.comments.length}
                            </div>
                        </div>
                    </div>
                    <div className="your-comment">
                            <input id="reply" placeholder="Write a comment" ref={inputRef} onChange={(e) => setcomtext({...comtext, text: e.target.value})}></input>
                            <button id="replybtn" onClick={async () => await SubmitComment(post._id)}>Send</button>
                        </div>
                    </>
                ))}
            </div>
            </div>
            {/* Single Comment Section */}
            <div className="comment-section">
                {activePostId ? (
                    <>
                        <div className="comment-head">
                            Comments on {users.usernames[posts.findIndex(post => post._id === activePostId)]}'s post
                        </div>
                        <div className="comment-detail">
                            {com.length > 0 ? (
                                com.map((comment, idx) => (
                                    <div className="top-comment" key={idx}>
                                        <div className='user-com-head'>
                                          <div className='compic'><img src={pic} alt='pick'></img> </div>
                                        <div className="top-profile">{comusers.usernames[idx] || 'Anonymous'}
                                            <button id='reply-visible' onClick={ async () => await handlereply(comment._id)}>replies</button>
                                        </div>
                                        </div>
                                        <div className="top-mssg">{comment.text}</div>

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
                        {/* <div className="your-comment">
                            <input id="reply" placeholder="Write a comment" ref={inputRef} onChange={(e) => setcomtext({...comtext, text: e.target.value})}></input>
                            <button id="replybtn" onClick={async () => await SubmitComment(comid)}>Send</button>
                        </div> */}
                    </>
                ) : (
                    // <div className="comment-detail">
                    //     <div className="no-comments">Now you have hidden the comments</div>
                    // </div>
                    
                    <div className='other'>
                    <div className="recommendation-head">Accounts You don't follow back</div>
                <div className="recommend">
                    <div className="rec-user">
                        <div class='rec-photo'><img src={sixth}></img></div>
                        <div className='rec-name'>Alice</div>
                        <div className='rec-follow'>Follows you</div>
                        <div className='rec-btn'>
                            <button id='removebtn'>Remove</button>
                            <button id='fbackbtn'>Follow Back</button>
                        </div>
                        </div>
                        <div className="rec-user">
                        <div class='rec-photo'><img src={seventh}></img></div>
                        <div className='rec-name'>Bob</div>
                        <div className='rec-follow'>Follows you</div>
                        <div className='rec-btn'>
                            <button id='removebtn'>Remove</button>
                            <button id='fbackbtn'>Follow Back</button>
                        </div>
                        </div>
                        <div className="rec-user">
                        <div class='rec-photo'><img src={eigth}></img></div>
                        <div className='rec-name'>Carlsen</div>
                        <div className='rec-follow'>Follows you</div>
                        <div className='rec-btn'>
                            <button id='removebtn'>Remove</button>
                            <button id='fbackbtn'>Follow Back</button>
                        </div>
                        </div>
                        <div className="rec-user">
                        <div class='rec-photo'><img src={pic}></img></div>
                        <div className='rec-name'>Goku</div>
                        <div className='rec-follow'>Follows you</div>
                        <div className='rec-btn'>
                            <button id='removebtn'>Remove</button>
                            <button id='fbackbtn'>Follow Back</button>
                        </div>
                        </div>
                </div>
                </div>
                )}
            </div>
        </div>
    );
};

export default Showcase;
