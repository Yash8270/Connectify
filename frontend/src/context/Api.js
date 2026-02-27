import React, { useState, useEffect, useCallback, useRef } from 'react';
import ConnectContext from './Connectcontext';
import Cookies from 'js-cookie';
import { io } from 'socket.io-client';

// ── Single socket instance ────────────────────────────────────────
// Change this back to the production URL when deploying
const socket = io('https://connectify-aml7.onrender.com', {
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

// const socket = io('http://localhost:5000', {
//   withCredentials: true,
//   autoConnect: true,
//   reconnection: true,
//   reconnectionAttempts: Infinity,
//   reconnectionDelay: 1000,
// });

const Api = (props) => {
  // const host = "http://localhost:5000";
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

  // ── Loading states ────────────────────────────────────────────
  const [loadingBarProgress, setLoadingBarProgress] = useState(0);
  const [loginLoading, setLoginLoading] = useState(false);
  const [postLoading, setPostLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);

  // ── Notification banner ───────────────────────────────────────
  const [chatNotif, setChatNotif] = useState(null);
  const chatNotifTimer = useRef(null);

  const authdataRef = useRef(authdata);
  useEffect(() => {
    authdataRef.current = authdata;
  }, [authdata]);

  // ✅ Get Unseen Count instantly from DB (Memoized)
  const notification = useCallback(async () => {
    try {
      const response = await fetch(`${host}/api/chat/unseen`, { credentials: 'include' });
      const json = await response.json();
      setnchat(json.unseenCount);
      return json;
    } catch (error) { console.log(error); }
  }, []);

  // ✅ Fetch unread counts immediately on app load
  useEffect(() => {
    if (authdata?.userid) {
      notification();
    }
  }, [authdata?.userid, notification]);


  // ── SOCKET SETUP ─────────────────────────────────────────────
  useEffect(() => {
    const userId = authdata?.userid;
    if (!userId) return;

    if (socket.connected) {
      console.log('Socket already connected — registering:', userId);
      socket.emit('registerUser', userId);
    }

    const handleConnect = () => {
      console.log('Socket connected — registering:', userId);
      socket.emit('registerUser', userId);
    };

    // Notification banner for incoming messages
    const handleNotif = (data) => {
      setChatNotif(data);
      
      if (chatNotifTimer.current) clearTimeout(chatNotifTimer.current);
      chatNotifTimer.current = setTimeout(() => setChatNotif(null), 4000);

      // ✅ FIX: Instead of blind +1, fetch real count.
      // Delaying by 800ms ensures if Chat.js is actively open, it marks it seen BEFORE this fetches.
      setTimeout(() => {
        notification();
      }, 800);
    };

    socket.on('connect', handleConnect);
    socket.on('notif', handleNotif);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('notif', handleNotif);
      if (chatNotifTimer.current) clearTimeout(chatNotifTimer.current);
    };
  }, [authdata?.userid, notification]);

  // ── Load cookies ──────────────────────────────────────────────
  useEffect(() => {
    try {
      const authtoken = Cookies.get('auth-token');
      const userid = Cookies.get('userid');
      if (authtoken && userid) setauthdata({ authtoken, userid });
      setfollowname('');
    } catch (error) {
      console.log("Cookie load error:", error);
    }
  }, []);

  // ── Load all users for search ─────────────────────────────────
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

  // ── Load follow requests ──────────────────────────────────────
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

  // ── Sign-in ───────────────────────────────────────────────────
  const signin = async (formData) => {
    setLoadingBarProgress(30);
    setLoginLoading(true);
    try {
      const response = await fetch(`${host}/api/auth/signin`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      setLoadingBarProgress(70);
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
      setLoadingBarProgress(100);
      socket.emit('registerUser', json.userid);
      notification(); // Initialize counts
      return json;
    } catch (error) {
      console.log("Signin error:", error);
      setLoadingBarProgress(100);
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Login ─────────────────────────────────────────────────────
  const login_fxn = async (username, password) => {
    setLoadingBarProgress(30);
    setLoginLoading(true);
    try {
      const response = await fetch(`${host}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });
      setLoadingBarProgress(60);
      if (response.status === 401 || response.status === 500) {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Something went wrong'}`);
        setLoadingBarProgress(100);
        setLoginLoading(false);
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
      setLoadingBarProgress(100);
      socket.emit('registerUser', json.userid);
      notification(); // Initialize counts
      alert('Login successful!');
      return json;
    } catch (error) {
      console.log("Login error:", error);
      setLoadingBarProgress(100);
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Posts ─────────────────────────────────────────────────────
  const getallpost = useCallback(async () => {
    setLoadingBarProgress(20);
    setPostLoading(true);
    try {
      const response = await fetch(`${host}/api/post/getall`, { credentials: 'include' });
      setLoadingBarProgress(70);
      const data = await response.json();
      setLoadingBarProgress(100);
      return data;
    } catch (error) {
      console.log(error);
      setLoadingBarProgress(100);
    } finally {
      setPostLoading(false);
    }
  }, []);

  const idtouser = useCallback(async (ids) => {
    try {
      const response = await fetch(`${host}/api/auth/idtouser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      return await response.json();
    } catch (error) { console.log(error); }
  }, []);

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
    setCommentLoading(true);
    try {
      const response = await fetch(`${host}/api/post/getcomment/${postid}`, { credentials: 'include' });
      return await response.json();
    } catch (error) { console.log(error); }
    finally { setCommentLoading(false); }
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
    setReplyLoading(true);
    try {
      const response = await fetch(`${host}/api/post/getreply/${comment_id}`, { credentials: 'include' });
      return await response.json();
    } catch (error) { console.log(error); }
    finally { setReplyLoading(false); }
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
    setPostLoading(true);
    try {
      const response = await fetch(`${host}/api/post/selfpost`, { credentials: 'include' });
      return await response.json();
    } catch (error) { console.log(error); }
    finally { setPostLoading(false); }
  };

  const getchat = async (participant) => {
    setChatLoading(true);
    setLoadingBarProgress(30);
    try {
      const response = await fetch(`${host}/api/chat/getchat/${participant}`, { credentials: 'include' });
      setLoadingBarProgress(100);
      return await response.json();
    } catch (error) {
      console.log(error);
      setLoadingBarProgress(100);
    } finally {
      setChatLoading(false);
    }
  };

  const userchat = useCallback(async () => {
    setChatLoading(true);
    try {
      const response = await fetch(`${host}/api/chat/chatuser`, { credentials: 'include' });
      const json = await response.json();
      return Array.isArray(json) ? json : [];
    } catch (error) {
      console.log(error);
      return [];
    } finally {
      setChatLoading(false);
    }
  }, []);

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
    setPostLoading(true);
    try {
      const response = await fetch(`${host}/api/post/getpost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fname }),
        credentials: 'include'
      });
      return await response.json();
    } catch (error) { console.log(error); }
    finally { setPostLoading(false); }
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

  const profile_following = useCallback(async () => {
    try {
      const response = await fetch(`${host}/api/follow/followingpic`, { credentials: 'include' });
      return await response.json();
    } catch (error) { console.log(error); }
  }, []);

  const only_followers = useCallback(async () => {
    try {
      const response = await fetch(`${host}/api/follow/nfback`, { credentials: 'include' });
      return await response.json();
    } catch (error) { console.log(error); }
  }, []);

  const remfollower = async (id) => {
    try {
      const response = await fetch(`${host}/api/follow/removefollower/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      return await response.json();
    } catch (error) { console.log(error); }
  };

  return (
    <ConnectContext.Provider value={{
      authdata, setauthdata, signin, login_fxn, getallpost, idtouser,
      likepost, dislikepost, getcom, postcom, getreply, postreply,
      selfpost, getchat, userchat, chatting, cloudimage,
      searchuser, followname, setfollowname, followpost, frequest,
      nfollow, setnfollow, acceptreq, followreq, setfollowreq,
      rejectreq, currentChat, setcurrentChat, firstchat, reqstatus,
      unfuser, remfollower, seenstatus, delMessage, delchat, nchat, setnchat,
      notification, socket, profile_following, only_followers,
      chatNotif, setChatNotif,
      loadingBarProgress, setLoadingBarProgress,
      loginLoading, postLoading, chatLoading, commentLoading, replyLoading
    }}>
      {props.children}
    </ConnectContext.Provider>
  );
};

export default Api;