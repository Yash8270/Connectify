import React, { useState, useEffect } from 'react';
import Connect_Context from './Connectcontext';
import Cookies from 'js-cookie';
import { io } from 'socket.io-client';

const socket = io('https://connectify-aml7.onrender.com', {
  withCredentials: true,
});

const Api = (props) => {
  const host = "https://connectify-aml7.onrender.com";

  const [authdata, setauthdata] = useState({
    authtoken: Cookies.get('auth-token'),
    userid: Cookies.get('userid'),
  });

  const [searchuser, setsearchuser] = useState([]);
  const [followname, setfollowname] = useState('');
  const [nchat, setnchat] = useState(0);
  const [nfollow, setnfollow] = useState(0);
  const [followreq, setfollowreq] = useState([]);
  const [currentChat, setcurrentChat] = useState('Hello');

  // ✅ Load cookies
  useEffect(() => {
    try {
      const authtoken = Cookies.get('auth-token');
      const userid = Cookies.get('userid');

      if (authtoken && userid) {
        setauthdata({ authtoken, userid });
      }

      setfollowname('');
    } catch (error) {
      console.log("Cookie load error:", error);
    }
  }, []);

  // ✅ Load users
  useEffect(() => {
    const search = async () => {
      try {
        const response = await fetch(`${host}/api/auth/all`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        const json = await response.json();
        setsearchuser(json);
      } catch (error) {
        console.log("Search user error:", error);
      }
    };

    search();
  }, []);

  // ✅ Load follow requests
  useEffect(() => {
    if (!authdata?.authtoken || !authdata?.userid) return;

    const pending = async () => {
      try {
        const response = await fetch(`${host}/api/follow/selfreq`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (!response.ok) return;

        const json = await response.json();
        setfollowreq(json);
        setnfollow(json.length);
      } catch (error) {
        console.log("Self request error:", error);
      }
    };

    pending();
  }, [authdata]);

  // ✅ Sign-in
  const signin = async (formData) => {
    try {
      const response = await fetch(`${host}/api/auth/signin`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const json = await response.json();
      setauthdata(json);

      Cookies.set('auth-token', json.authtoken, { expires: 1, secure: true, sameSite: 'None' });
      Cookies.set('userid', json.userid, { expires: 1, secure: true, sameSite: 'None' });
      Cookies.set('username', json.user_detail.username, { expires: 1, secure: true, sameSite: 'None' });
      Cookies.set('followers', json.user_detail.followers.length, { expires: 1, secure: true, sameSite: 'None' });
      Cookies.set('following', json.user_detail.following.length, { expires: 1, secure: true, sameSite: 'None' });
      Cookies.set('profile', json.user_detail.profilepic, { expires: 1, secure: true, sameSite: 'None' });
      Cookies.set('bio', json.user_detail.bio, { expires: 1, secure: true, sameSite: 'None' });
      Cookies.set('skills', json.user_detail.skills, { expires: 1, secure: true, sameSite: 'None' });

      return json;
    } catch (error) {
      console.log("Signin error:", error);
    }
  };

  // ✅ Login
  const login_fxn = async (username, password) => {
    try {
      const response = await fetch(`${host}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      if (response.status === 401 || response.status === 500) {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Something went wrong'}`);
        return errorData.value;
      }

      const json = await response.json();
      setauthdata(json);

      Cookies.set('auth-token', json.authtoken, { expires: 1, secure: true, sameSite: 'None' });
      Cookies.set('userid', json.userid, { expires: 1, secure: true, sameSite: 'None' });
      Cookies.set('username', json.user_detail.username, { expires: 1, secure: true, sameSite: 'None' });
      Cookies.set('followers', json.user_detail.followers.length, { expires: 1, secure: true, sameSite: 'None' });
      Cookies.set('following', json.user_detail.following.length, { expires: 1, secure: true, sameSite: 'None' });
      Cookies.set('profile', json.user_detail.profilepic, { expires: 1, secure: true, sameSite: 'None' });
      Cookies.set('bio', json.user_detail.bio, { expires: 1, secure: true, sameSite: 'None' });
      Cookies.set('skills', json.user_detail.skills, { expires: 1, secure: true, sameSite: 'None' });

      alert('Login successful!');
      return json;
    } catch (error) {
      console.log("Login error:", error);
    }
  };

  // ✅ Posts
  const getallpost = async () => {
    try {
      const response = await fetch(`${host}/api/post/getall`, { credentials: 'include' });
      return await response.json();
    } catch (error) { console.log(error); }
  };

  const idtouser = async (ids) => {
    try {
      const response = await fetch(`${host}/api/auth/idtouser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      return await response.json();
    } catch (error) { console.log(error); }
  };

  const likepost = async (postid) => {
    try {
      const response = await fetch(`${host}/api/post/like/${postid}`, { method: 'PATCH', credentials: 'include' });
      return await response.json();
    } catch (error) { console.log(error); }
  };

  const dislikepost = async (postid) => {
    try {
      const response = await fetch(`${host}/api/post/dislike/${postid}`, { method: 'PATCH', credentials: 'include' });
      return await response.json();
    } catch (error) { console.log(error); }
  };

  const getcom = async (postid) => {
    try {
      const response = await fetch(`${host}/api/post/getcomment/${postid}`, { credentials: 'include' });
      return await response.json();
    } catch (error) { console.log(error); }
  };

  const postcom = async (postid, auth_token, text) => {
    try {
      const response = await fetch(`${host}/api/post/comment/${postid}`, {
        method: 'PATCH',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ text }),
        credentials: 'include'
      });
      return await response.json();
    } catch (error) { console.log(error); }
  };

  const getreply = async (comment_id) => {
    try {
      const response = await fetch(`${host}/api/post/getreply/${comment_id}`, { credentials: 'include' });
      return await response.json();
    } catch (error) { console.log(error); }
  };

  const postreply = async (comment_id, auth_token, text) => {
    try {
      const response = await fetch(`${host}/api/post/reply/${comment_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        credentials: 'include'
      });
      return await response.json();
    } catch (error) { console.log(error); }
  };

  const selfpost = async () => {
    try {
      const response = await fetch(`${host}/api/post/selfpost`, { credentials: 'include' });
      return await response.json();
    } catch (error) { console.log(error); }
  };

  const getchat = async (participant) => {
    try {
      const response = await fetch(`${host}/api/chat/getchat/${participant}`, { credentials: 'include' });
      return await response.json();
    } catch (error) { console.log(error); }
  };

  const userchat = async () => {
    try {
      const response = await fetch(`${host}/api/chat/chatuser`, { credentials: 'include' });
      const json = await response.json();
      console.log("USER CHAT NAMES: ", json);
      return json;
    } catch (error) { console.log(error); }
  };

  const firstchat = async (participants, mssg) => {
    try {
      const response = await fetch(`${host}/api/chat/newchat/${participants}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mssg }),
        credentials: 'include'
      });
      return await response.json();
    } catch (error) { console.log(error); }
  };

  const chatting = async (participants, auth_token, mssg) => {
    try {
      const response = await fetch(`${host}/api/chat/updatechat/${participants}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mssg }),
        credentials: 'include'
      });
      return await response.json();
    } catch (error) { console.log(error); }
  };

  const cloudimage = async (formData) => {
    try {
      const response = await fetch(`${host}/api/post/postpic`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      return await response.json();
    } catch (error) { console.log(error); }
  };

  const followpost = async (fname) => {
    try {
      const response = await fetch(`${host}/api/post/getpost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fname }),
        credentials: 'include'
      });
      return await response.json();
    } catch (error) { console.log(error); }
  };

  const frequest = async (name) => {
    try {
      const response = await fetch(`${host}/api/follow/followreq/${name}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      return await response.json();
    } catch (error) { console.log(error); }
  };

  const acceptreq = async (id) => {
    try {
      const response = await fetch(`${host}/api/follow/addfollower/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      return await response.json();
    } catch (error) { console.log(error); }
  };

  const rejectreq = async (id) => {
    try {
      const response = await fetch(`${host}/api/follow/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
        credentials: 'include'
      });
      return await response.json();
    } catch (error) { console.log(error); }
  };

  const reqstatus = async (id) => {
    try {
      const response = await fetch(`${host}/api/follow/sentreq/${id}`, { credentials: 'include' });
      return await response.json();
    } catch (error) { console.log(error); }
  };

  const unfuser = async (id) => {
    try {
      const response = await fetch(`${host}/api/follow/unfollow/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      return await response.json();
    } catch (error) { console.log(error); }
  };

  const seenstatus = async (id, stamp) => {
    try {
      const response = await fetch(`${host}/api/chat/chatseen/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stamp }),
        credentials: 'include'
      });
      return await response.json();
    } catch (error) { console.log(error); }
  };

  const notification = async () => {
    try {
      const response = await fetch(`${host}/api/chat/unseen`, { credentials: 'include' });
      const json = await response.json();
      setnchat(json.unseenCount);
      return json;
    } catch (error) { console.log(error); }
  };

  const delMessage = async (id) => {
    try {
      const response = await fetch(`${host}/api/chat/delmssg/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      return await response.json();
    } catch (error) { console.log(error); }
  };

  const delchat = async (id) => {
    try {
      const response = await fetch(`${host}/api/chat/delchat/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      return await response.json();
    } catch (error) { console.log(error); }
  };

  const profile_following = async () => {
    try {
      const response = await fetch(`${host}/api/follow/followingpic`, { credentials: 'include' });
      return await response.json();
    } catch (error) { console.log(error); }
  };

  const only_followers = async () => {
    try {
      const response = await fetch(`${host}/api/follow/nfback`, { credentials: 'include' });
      return await response.json();
    } catch (error) { console.log(error); }
  };

  return (
    <Connect_Context.Provider value={{
      authdata, setauthdata, signin, login_fxn, getallpost, idtouser,
      likepost, dislikepost, getcom, postcom, getreply, postreply,
      selfpost, getchat, userchat, chatting, cloudimage,
      searchuser, followname, setfollowname, followpost, frequest,
      nfollow, setnfollow, acceptreq, followreq, setfollowreq,
      rejectreq, currentChat, setcurrentChat, firstchat, reqstatus,
      unfuser, seenstatus, delMessage, delchat, nchat, setnchat,
      notification, socket, profile_following, only_followers
    }}>
      {props.children}
    </Connect_Context.Provider>
  );
};

export default Api;
