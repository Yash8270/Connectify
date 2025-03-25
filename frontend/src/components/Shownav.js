import React, { useContext, useEffect, useState } from 'react';
import '../css_file/Shownav.css';
import { Link, useNavigate } from 'react-router-dom';
import Connect_Context from '../context/Connectcontext';
import Post from './Post';
import Update from './Update';
import Cookies from 'js-cookie';
import Request from '../assets/request.svg';
import chat from '../assets/chat.svg';
import upload from '../assets/upload.svg';
import Profile from '../assets/profile.svg';

const Shownav = () => {
  const context = useContext(Connect_Context);
  const { authdata, searchuser, followname, setfollowname, nfollow, setnfollow,
     socket, idtouser, nchat, setnchat, followreq, notification } = context;

  // State to control modal visibility
  const [show, setShow] = useState(false);
  const [showreq, setshowreq] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate
  const [reqname, setreqname] = useState({usernames:[]});

  useEffect(() => {
    const request_update = async () => {

        if(followreq.length > 0) {
          const useridarray = followreq.map(request => request.from);
          const usernames = await idtouser(useridarray);
          setreqname(usernames);
        }          
    };

    request_update();
}, [followreq]); // No need for `socket` here

useEffect(() => {
    socket.emit('registerUser', authdata.userid);
}, [socket]); // Only runs when `socket` changes



useEffect(() => {

 notification();
 console.log("NOTIFICATION");
 console.log(nchat);
  
  socket.on('notif', async (data) => {
    console.log('NOTIFICATION');
    const l = await notification();
    console.log("UNSEEN CHAT: ", l);
  });

  return () => {
    socket.off('privateMessage');
  }

},[socket]);

//  console.log(followname);
//  console.log("no. of requests:",nfollow);
const handleInputChange = (e) => {
  const input = e.target.value;
  setQuery(input);

  if (input) {
      setTimeout(() => {
          if (Array.isArray(searchuser)) { // Ensure searchuser is an array
              const filteredSuggestions = searchuser.filter((user) =>
                  user.username?.toLowerCase().includes(input.toLowerCase())
              );
              setSuggestions(filteredSuggestions);
          } else {
              setSuggestions([]);
              console.warn("searchuser is not an array:", searchuser);
          }
      }, 500); // Delay filtering by 500ms
  } else {
      setSuggestions([]);
  }
};


  const handleUserClick = (user) => {
    setQuery(''); // Set the input value to the clicked username
    setfollowname(user.username);
    setSuggestions([]); // Clear the suggestions list
    navigate(`/userprofile/${user._id}`); // Redirect to the profile page with the username as a route parameter
    
  };

  const toggleModal = () => {
    setShow((prevShow) => !prevShow);
  };

  const toggleUpdate = () => {
    setshowreq((prevShow) => !prevShow);
  }

  const handleCookie = () => {
    Cookies.remove('auth-token');
    Cookies.remove('userid');
    Cookies.remove('username');
    Cookies.remove('followers');
    Cookies.remove('following');

  }



  return (
    <nav>
    <div className="show-container">
      <div className="showname">Welcome {Cookies.get('username')}</div>
      <div className="center-nav">
        <div className="search" style={{ position: 'relative' }}>
          <input type="text" value={query} onChange={handleInputChange} placeholder="Search usernames" id="searchuser" />
          {suggestions.length > 0 && (
            <ul className="suggestion-list">
              {suggestions.map((user, index) => (
                <li key={index} className="suggestion-item" onClick={() => handleUserClick(user)}>
                  {user.username || 'No username found'}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="update">
          {/* <button id="navpostbtn" style={{ textDecoration: 'none', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
           onClick={toggleUpdate}> */}
            <img id="requestimg" src={Request} alt="Update"  onClick={toggleUpdate} />
            {/* </button> */}
          {nfollow > 0 ? <span className='badge-update'>{nfollow}</span> : <></>}
        </div>
        <div className="chat">
          <Link to={`/chat/${authdata.userid}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <img id="chatimg" src={chat} alt="Chat" />
          </Link>
          {nchat > 0 ? <span className='badge'>{nchat}</span>:<></>}
        </div>
        <div className="post" onClick={toggleModal}>
          Post
        </div>
        <div className="back">
          <Link to={`/showcase/${authdata.userid}`} style={{ textDecoration: 'none', color: 'inherit' }}>Back</Link>
        </div>
      </div>
      <div className="profile" onClick={handleCookie}>
        <Link to={'/'} style={{ textDecoration: 'none', color: 'inherit' }}>Logout</Link>
      </div>
    </div>
    <Update showreq={showreq} setshowreq={setshowreq} reqname={reqname} setreqname={setreqname} />
    <Post show={show} setShow={setShow} />
  </nav>
  
  );
};

export default Shownav;
