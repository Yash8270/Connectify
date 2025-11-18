
import React, { useState, useEffect } from 'react';
import Connect_Context from './Connectcontext';
import Cookies from 'js-cookie';
import {io} from 'socket.io-client';

const socket = io('http://localhost:5000');

const Api = (props) => {
    const host  = "http://localhost:5000";
    const [authdata,setauthdata] = useState({authtoken: Cookies.get('auth-token'), userid: Cookies.get('userid')});
      const [searchuser, setsearchuser] = useState([]);
      const [followname, setfollowname] = useState('');
      const [nchat, setnchat] = useState(0);
      const [nfollow, setnfollow] = useState(0);
      const [followreq, setfollowreq] = useState([]);
      const [currentChat, setcurrentChat] = useState('Hello');
    // alert(authtoken);

    
    useEffect(() => {
        // Retrieve cookies after component mounts
        const authtoken = Cookies.get('auth-token');
        const userid = Cookies.get('userid');

           

        if(authtoken && userid) {
            // console.log("FOUND");
            setauthdata({authtoken: authtoken, userid: userid});
        }
    
        setfollowname('');
      }, []);

      useEffect(() => {

        const search = async () => {
            const response = await fetch(`${host}/api/auth/all`, {
                method: 'GET',
                headers: {
                    'Content-Type':'application/json'
                },
                credentials: 'include'
            });
        
            const json = await response.json();
            setsearchuser(json);
      }
    
      search();
    
      },[]);

      useEffect(() => {
        const pending = async () => {
            const response = await fetch(`${host}/api/follow/selfreq`,{
                method: 'GET',
                headers: {
                    'Content-Type':'application/json'
                },
                credentials:'include'
            });
            const json = await response.json();
            setfollowreq(json);
             setnfollow(json.length);
             console.log(json);
        }

       pending();
       
      },[authdata]);


    // console.log("The cookie: ",authdata);

    //Sign-in
    const signin = async (formData) => {
        const response = await fetch(`${host}/api/auth/signin`, {
            method: 'POST',
            headers :{
                // 'Content-Type':'application/json'
            }, 
            body: formData                         
        });

        const json = await response.json();
        // console.log(json);
        setauthdata(json);
        // setauthdata({authtoken: Cookies.get('auth-token'), userid: Cookies.get('userid')});

        Cookies.set('auth-token', json.authtoken, {
            expires: 1,
            secure:true,
            sameSite:'None'
        });

        Cookies.set('userid', json.userid, {
            expires: 1,
            secure:true,
            sameSite:'None'
        });

        Cookies.set('username', json.user_detail.username, {
            expires: 1,
            secure:true,
            sameSite:'None'
        });

        Cookies.set('followers', json.user_detail.followers.length, {
            expires: 1,
            secure:true,
            sameSite:'None'
        });

        Cookies.set('following', json.user_detail.following.length, {
            expires: 1,
            secure: true,
            sameSite:'None'
        });

        Cookies.set('profile', json.user_detail.profilepic, {
            expires: 1,
            secure: true,
            sameSite:'None'
        });

        Cookies.set('bio',json.user_detail.bio, {
            expires:1,
            secure: true,
            sameSite:'None'
        });

        Cookies.set('skills', json.user_detail.skills, {
            expires: 1,
            secure: true,
            sameSite:'None'
        });

        return json;
        // alert('Successfully Sign-In');
    }

    //login
    const login_fxn = async (username, password) => {
        const response = await fetch(`${host}/api/auth/login`, {
            method: 'POST',
            headers : {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({username,password})
        });

        if (response.status === 401 || response.status === 500) {
            const error = await response.json();
            alert(`Error: ${error.message || 'Something went wrong'}`);
            return error.value;
        }

        const json = await response.json();
        setauthdata(json);
        console.log(json);
        // setauthdata({authtoken: Cookies.get('auth-token'), userid: Cookies.get('userid')});

        Cookies.set('auth-token', json.authtoken, {
            expires: 1,
            secure:true,
            sameSite:'None'
        });

        Cookies.set('userid', json.userid, {
            expires: 1,
            secure:true,
            sameSite:'None'
        });

        Cookies.set('username', json.user_detail.username, {
            expires: 1,
            secure:true,
            sameSite:'None'
        });

        Cookies.set('followers', json.user_detail.followers.length, {
            expires: 1,
            secure:true,
            sameSite:'None'
        });

        Cookies.set('following', json.user_detail.following.length, {
            expires: 1,
            secure: true,
            sameSite:'None'
        });

        Cookies.set('profile', json.user_detail.profilepic, {
            expires: 1,
            secure: true,
            sameSite:'None'
        });

        Cookies.set('bio',json.user_detail.bio, {
            expires:1,
            secure: true,
            sameSite:'None'
        });

        Cookies.set('skills', json.user_detail.skills, {
            expires: 1,
            secure: true,
            sameSite:'None'
        });

        alert('Login successful!');       
        return json;
    }

    //Getting all Posts
    const getallpost = async (auth_token) => {

        const response = await fetch(`${host}/api/post/getall`, {
            method: 'GET',
            headers: {
                'Content-Type':'application/json',
                // 'auth-token':`${auth_token}`
            },
            credentials: 'include'
       });

       const json = await response.json();
       return json;
    }
   
    //convert userid to username
    const idtouser = async (ids) => {
        const response = await fetch(`${host}/api/auth/idtouser`,{
            method:'POST',
            headers: {
                'Content-Type':'application/json'
            },

            body: JSON.stringify({ids})
        });
       const json = await response.json();
    //    console.log(json);
       return json;
    }


   //Like the post
   const likepost = async (postid, auth_token) => {
    const response = await fetch(`${host}/api/post/like/${postid}`, {
        method: 'PATCH',
        headers : {
            'Content-Type':'application/json',
            // 'auth-token':`${auth_token}`
        },
        credentials: 'include'
    });
    const json = await response.json();
    return json;
   } 


   //Dislike the post
   const dislikepost = async (postid, auth_token) => {
    const response = await fetch(`${host}/api/post/dislike/${postid}`, {
        method: 'PATCH',
        headers: {
            'Content_Type':'application/json',
            // 'auth-token':`${auth_token}`
        },
        credentials: 'include'
    });
    const json = await response.json();
    return json;
   }

   //Get comments on specific post
   const getcom = async (postid, auth_token) => {
    const response = await fetch(`${host}/api/post/getcomment/${postid}`, {
        method: 'GET',
        headers: {
            'Content-Type':'application/json',
            // 'auth-token':`${auth_token}`
        },
        credentials: 'include'
    });

     const json = await response.json();
     return json;
   }

   //Post the comment
   const postcom = async (postid, auth_token, text) => {
    const response = await fetch(`${host}/api/post/comment/${postid}`, {
        method: 'PATCH',
        headers: {
            'Content-type':'application/json',
            // 'auth-token':`${auth_token}`
        },
        body: JSON.stringify({text}),
        credentials: 'include'
    });

     const json = await response.json();
     return json;
   }

   //Get reply on a comment
   const getreply = async (comment_id, auth_token) => {
    const response = await fetch(`${host}/api/post/getreply/${comment_id}`, {
        method: 'GET',
        headers: {
            'Content-Type':'application/json',
            // 'auth-token':`${auth_token}`
        },
        credentials: 'include'
    });

    const json = await response.json();
    return json;
   }

   //Post a reply on a comment
   const postreply = async (comment_id, auth_token, text) => {
    const response = await fetch(`${host}/api/post/reply/${comment_id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type':'application/json',
            // 'auth-token':`${auth_token}`
        },
        body: JSON.stringify({text}),
        credentials: 'include'
    });

    const json = await response.json();
    return json;
   }

   //Get profile post
   const selfpost = async (auth_token) => {
    const response = await fetch(`${host}/api/post/selfpost`, {
        method: 'GET',
        headers: {
            'Content-Type':'application/json',
            // 'auth-token':`${auth_token}`
        },
        credentials: 'include'
    });
    const json = await response.json();
    return json;
   }

   //Get chats
   const getchat = async (participant, auth_token) => {
    const response = await fetch(`${host}/api/chat/getchat/${participant}`, {
        method: 'GET',
        headers: {
            'Content-Type':'application/json',
            // 'auth-token':`${auth_token}`
        },
        credentials: 'include'
    });

    const json = await response.json();
    return json;
   }

   //get usernames and profilepics of chats
   const userchat = async (auth_token) => {
    const response = await fetch(`${host}/api/chat/chatuser`, {
        method:'GET',
        headers: {
            'Content-Type':'application/json',
            // 'auth-token':`${auth_token}`
        },
        credentials: 'include'
    });

    const json = await response.json();
    console.log("USER CHAT NAMES: ", json);
    return json;
   }

   //New chat
   const firstchat = async (participants, mssg) => {
    const response = await fetch(`${host}/api/chat/newchat/${participants}`, {
        method:'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify({mssg}),
        credentials:'include'
    });

    const json = await response.json();
    return json;
   }

   //Continues Chat
   const chatting = async (participants, auth_token, mssg) => {
    const response = await fetch(`${host}/api/chat/updatechat/${participants}`, {
        method: 'PATCH',
        headers: {
            'Content-Type':'application/json',
            // 'auth-token':`${auth_token}`
        },
        body: JSON.stringify({mssg}),
        credentials: 'include'
    });

    const json = await response.json();
    return json;
   }

   //Post an Image
   const cloudimage = async (formData, auth_token) => {

    const response = await fetch(`${host}/api/post/postpic`, {
        method: 'POST',
        headers : {
            // 'auth-token':`${auth_token}`
        },
        body: formData,
        credentials: 'include'
    });

    const json = await response.json();
    return json;
   }

   //Get post of follower
   const followpost = async (fname) => {
    const response = await fetch(`${host}/api/post/getpost`, {
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify({fname}),
        credentials:'include'
    });

    const json = await response.json();
    return json;
   }


   //Follow request sent
   const frequest = async (name) => {
    const response = await fetch(`${host}/api/follow/followreq/${name}`, {
        method:'PATCH',
        headers: {
            'Content-Type':'application/json'
        },
        credentials: 'include'
    });
    const json = await response.json();
    return json;
   }

   //Accept Request
   const acceptreq = async (id) => {
    const response = await fetch(`${host}/api/follow/addfollower/${id}`, {
        method:'PATCH',
        headers: {
            'Content-Type':'application/json'
        },
        credentials: 'include'
    });

    const json = await response.json();
    return json;
   }

   //Reject Request
   const rejectreq = async (id) => {
    const response = await fetch(`${host}/api/follow/${id}`, {
        method:'PATCH',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify({id}),
        credentials: 'include'
    });

    const json = await response.json();
    return json;
   }

   //Sent Request
   const reqstatus = async (id) => {
    const response = await fetch(`${host}/api/follow/sentreq/${id}`, {
        method:'GET',
        headers: {
            'Content-Type':'application/json'
        },
        credentials:'include'
    });

    const json = await response.json();
    return json;
   }

   //Unfollow
   const unfuser = async (id) => {
    const response = await fetch(`${host}/api/follow/unfollow/${id}`, {
        method:'PATCH',
        headers: {
            'Content-Type':'application/json'
        },
        credentials:'include'
    });

    const json = await response.json();
    return json;
   }

   //Seen status
   const seenstatus = async (id, stamp) => {
    const response = await fetch(`${host}/api/chat/chatseen/${id}`, {
        method:'PATCH',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify({stamp}),
        credentials:'include'
    });
    const json = await response.json();
    return json;
   }

   //Unseen Chats
   const notification = async () => {
    const response = await fetch(`${host}/api/chat/unseen`, {
        method:'GET',
        headers: {
            'Content-Type':'application/json'
        },
        credentials:'include'
    });
    const json = await response.json();
    setnchat(json.unseenCount);
    return json;
};

   //Delete a Message
   const delMessage = async (id) => {
    const response = await fetch(`${host}/api/chat/delmssg/${id}`, {
        method: 'PATCH',
        headers : {
            'Content-Type':'application/json'
        },
        credentials:'include'
    });

    const json = await response.json();
    return json;
   }

   //Delete a chat
   const delchat = async (id) => {
    const response = await fetch(`${host}/api/chat/delchat/${id}`, {
        method:'DELETE',
        headers: {
            'Content-Type':'application/json'
        },
        credentials:'include'
    });

    const json = await response.json();
    return json;
   }

   //Following ProfilePic
   const profile_following = async () => {
    const response = await fetch(`${host}/api/follow/followingpic`, {
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        },
        credentials:'include'
    });

    const json = await response.json();
    return json;
   }

   //Accounts You don't follow back
   const only_followers = async () => {
    const response = await fetch(`${host}/api/follow/nfback`, {
        method:'GET',
        headers: {
            'Content-Type':'application/json'
        },
        credentials:'include'
    });

    const json = await response.json();
    return json;
   }
    
    return (
        <Connect_Context.Provider value={{ authdata,setauthdata,signin, login_fxn, getallpost, idtouser, likepost, dislikepost, getcom,
         postcom, getreply, postreply,selfpost, getchat, userchat, chatting, cloudimage, searchuser, followname, setfollowname,
          followpost, frequest,nfollow,setnfollow, acceptreq, followreq, setfollowreq, rejectreq, currentChat, setcurrentChat,
         firstchat, reqstatus, unfuser, seenstatus, delMessage, delchat, nchat, setnchat, notification, socket, profile_following,
          only_followers }}>
            {props.children}
        </Connect_Context.Provider>
    );

}

export default Api;
