import React, { useContext, useState, useEffect, useRef } from 'react';
import '../css_file/Chat.css';
import Connect_Context from '../context/Connectcontext';
import { useLocation } from 'react-router-dom';
import emoji from '../assets/emoji.svg';
import send from '../assets/send.svg';
import first from '../assets/first.jpg';
import second from '../assets/second.jpg';
import third from '../assets/third.jpg';
import fourth from '../assets/fourth.jpg';
import fifth from '../assets/fifth.jpg';
import sixth from '../assets/sixth.jpg';
import seventh from '../assets/seventh.jpg';
import eigth from '../assets/first.jpg';
import gojo from '../assets/gojo.jpg';
import Cookies from 'js-cookie';

const Chat = () => {

  const mssgref = useRef(null);
  const location = useLocation();
  let followid, chats;
  if(location.state === null) {
     followid = '';
     chats = 'hello';
  }
  else {
    followid = location.state.followid;
    chats = location.state.chats;
  }
    
  const context = useContext(Connect_Context);
  const { authdata,idtouser ,getchat ,userchat ,chatting,
      firstchat, seenstatus, delMessage, delchat, nchat, setnchat, notification, socket } = context;

  const [users, setusers] = useState({usernames:[]});
  const [participants, setparticipants] = useState([]);
  const [convo,setconvo] = useState([]);
  const [chatvisible, setchatvisible] = useState(false);
  const [mssg, setmssg] = useState({text:''});
  const [isTyping, setIsTyping] = useState({userid:'', TypingStatus:false});
  const [isSeen, setIsSeen] = useState({userid:'', seen:false});
  const [id,setid] = useState(followid);
  const [query, setQuery] = useState('');
   const [suggestions, setSuggestions] = useState([]);
  // const [dummy, setdummy] = useState([]);
  const [currentChat ,setcurrentChat] = useState(chats);

  const SeenMap = async (recid) => {
    const data = {
      userid: authdata.userid,
      receiverid: recid,
      seen: true
    };
    const stamp = new Date();
    socket.emit('seen', data);
    const seen_chat = await seenstatus(recid,stamp);
  }

  const handleChatonClick = async (id) => {
    setid(id);
    // const chatdata = await getchat(id, authdata.authtoken);
    // // console.log("HANDLE CHAT ON CLICK");
    // setconvo(chatdata.messages);
    const username = await idtouser([id]);
    setcurrentChat(username.usernames[0]);
    setchatvisible(true);
    await SeenMap(id);
    const updatedChatData = await getchat(id, authdata.authtoken); // Fetch the latest messages
    console.log("ON CLICK CHAT:",updatedChatData);
    setconvo(updatedChatData.messages); 
  }

  const handleInputChat = (e) => 
    {
      if(e.target.value === '') {
        const TypingStatus = {
          userid: authdata.userid,
          receiverid: id,
          TypingStatus: false
        };

        socket.emit('Typing', TypingStatus);
      }
      else {

        const TypingStatus = {
          userid: authdata.userid,
          receiverid: id,
          TypingStatus: true
        };

        socket.emit('Typing', TypingStatus);
      }
      setmssg({...mssg, text: e.target.value});
    }  

    useEffect(() => {
     
      socket.on('TypingStatus', (data) => {
        setIsTyping(data);
        // alert(`User ${data.userid} is typing: ${data.TypingStatus}`);
        // console.log(`User ${data.sender} is typing: ${data.TypingStatus}`);
      });
  
      // Clean up the listener on unmount
      return () => {
        socket.off('Typing');
        setIsTyping({userid:'', TypingStatus:false});
      };

    }, [socket]);

    useEffect(() => {
      socket.on('seen_status', async (data) => {
        // setIsSeen(data);

        const updatedChatData = await getchat(data.userid, authdata.authtoken); // Fetch the latest messages
          setconvo(updatedChatData.messages); 
        
      });

      return () => {
        socket.off('seen');
        setIsSeen({userid:'', seen: false});
      }
    },[socket]);

    useEffect(() => {
      socket.on('DeleteConfirm', async (data) => {
       
        if(data.size === 8) {
          const updatedChatData = await getchat(data.userid, authdata.authtoken); // Fetch the latest messages
          console.log("DELETE CONFIRMATION:",updatedChatData);
          setconvo(updatedChatData.messages); 
        } 
        else {
          setconvo([]);
          setcurrentChat('Hello');
          setid('');
        }
            
        const user_chat = await userchat(authdata.authtoken);
        setparticipants(user_chat);
        // console.log("USER CHAT NAMES:",user_chat);
        const usernames = await idtouser(user_chat);
        // console.log(usernames);
        setusers(usernames);
      });

      return () => {
        socket.off('DeleteMessage');
      }

    },[socket]);

    const handleChatfromSuggestion = async (names) => {
      const indice = users.usernames.indexOf(names);
      const findid = participants[indice];
      // console.log("PARTICIPANT:",findid);
      handleChatonClick(findid);
    }

  const SubmitChat = async (id) => {

    console.log("ID:", id);

    const newMessage = {
      recipientId: id,
      senderId: authdata.userid,
      message: mssg.text,
      timestamp: new Date(),
    };

    socket.emit('privateMessage', newMessage);

    if(participants.length > 0) {
      // console.log("PARTICIPANTS", participants);
      const message = await chatting(id, authdata.authtoken, mssg.text);
    }
    else {
      // console.log("NEW CHAT");
      const newmssg = await firstchat(id, mssg.text);
      // handleChatonClick(id);
    }

     const chatdata = await getchat(id, authdata.authtoken);
     setconvo(chatdata.messages);
    //  setIsTyping({userid:'', TypingStatus:false}); 
     
     const data = {
      userid: authdata.userid,
      receiverid: id,
      TypingStatus: false
     }  
     
     socket.emit('Typing', data);
     setmssg({text:''});

     
  }


  useEffect(() => {
    const fetchUser = async () => {

      try {
        const user_chat = await userchat(authdata.authtoken);
        setparticipants(user_chat);
        // console.log(user_chat);
        const usernames = await idtouser(user_chat);
        // console.log(usernames);
        setusers(usernames);
    } catch (error) {
        console.error("Error fetching posts:", error);
    }
  };

  fetchUser();
  const l = notification();
  setnchat(l);
  // socket.emit('registerUser', authdata.userid);

  },[socket,authdata,convo]);


  useEffect(() => {
    socket.on('newMessage', async (newMessage) => {

      console.log('New Messages');

      try {
        if (newMessage.sender === id) {
          await SeenMap(id);
          // console.log("id: ",id);
          // console.log("sender: ",newMessage.sender);
          const updatedChatData = await getchat(newMessage.sender, authdata.authtoken); // Fetch the latest messages
          setconvo(updatedChatData.messages); 
        }
       else {
        const user_chat = await userchat(authdata.authtoken);
        setparticipants(user_chat);
        // console.log("USER CHAT NAMES:",user_chat);
        const usernames = await idtouser(user_chat);
        // console.log(usernames);
        setusers(usernames);
        // console.log("User sent message");
       } 
      //  notification();

      } catch (error) {
        console.error("Error fetching updated chat data:", error);
      }
    });
  
    return () => {
      socket.off('newMessage'); 
    };
   

  },[socket,id, authdata]);

  useEffect(() => {
    
    if(mssgref.current) {
      // mssgref.current.scrollIntoView({behavior: 'smooth'});
      mssgref.current.scrollTop = mssgref.current.scrollHeight;
    }

  },[convo]); 
  
  function TimeMapping (time) {
const seenTime = new Date(time); // Current time when the message is marked as seen
const currenTime = new Date();
const durationInMilliseconds = currenTime - seenTime;
const durationInMinutes = Math.floor(durationInMilliseconds / (1000 * 60));
const durationInHours = Math.floor(durationInMilliseconds / (1000 * 60 * 60));

let result='';
// Example output
if (durationInMinutes < 1) {
  result ='Seen just now';
} else if (durationInMinutes < 60) {
  result = `Seen ${durationInMinutes}m ago`;
  // console.log(`Seen ${durationInMinutes} minute(s) ago`);
} else if (durationInHours < 24) {
  result = `Seen ${durationInHours}hr ago`
  // console.log(`Seen ${durationInHours} hour(s) ago`);
} else {
  const durationInDays = Math.floor(durationInHours / 24);
  result = `Seen ${durationInDays}d ago`;
  // console.log(`Seen ${durationInDays} day(s) ago`);
}
 return result;
  }

  const [showOptions, setShowOptions] = useState('');

  const toggleOptions = (mssgid) => {
    if(showOptions !== '') {
    setShowOptions('');
    }
    else {
      setShowOptions(mssgid);
    }
  };

  const handleDelete = async (mssgid) => {

    let data = {
      userid: authdata.userid,
      receiverid: id,
      size: 8
    };
    
    if(convo.length === 1) {
      data.size = 1;
      const remove_chat = await delchat(id);
      setconvo([]);
      setcurrentChat('Hello');
      setid('');
    }
    else {
      const updatechat = await delMessage(mssgid);
      // console.log("DELETED MESSAGE:", updatechat);
      setconvo(updatechat.messages);
    }
  
    setShowOptions(false); 
    socket.emit('DeleteMessage', data);

  }

  const handleDeleteChat = async (uid) => {
    const deletion = await delchat(uid);
    const user_chat = await userchat(authdata.authtoken);
    setparticipants(user_chat);
    // console.log("USER CHAT NAMES:",user_chat);
    const usernames = await idtouser(user_chat);
    // console.log(usernames);
    setusers(usernames);
  } 

  const handleInputChange = (e) => {
    const input = e.target.value;
    setQuery(input);
    // console.log(users.usernames[1]);
    if (input) {
      const filteredSuggestions = users.usernames.filter((user) =>
        user.toLowerCase().includes(input.toLowerCase()) // Case-insensitive match
      );
      console.log(filteredSuggestions);
      setSuggestions(filteredSuggestions);
      console.log("SUGGESTIONS ON CHAT ",suggestions);
    } else {
      setSuggestions([]);
    }
  };
      
    return (
      <>
        <div className="chatpage">

          <div className='convo-name'>
            <div className="searchchat">
              <input
                type="text"
                id="search-chat"
                placeholder="find the person"
              value= {query} onChange={handleInputChange}></input>

            {suggestions.length > 0 && (
            <ul className="suggestion-list-user">
              {suggestions.map((user, index) => (
                <li key={index} className="suggestion-item" onClick={async () => await handleChatfromSuggestion(user)}>
                  {user || 'No username found'}
                </li>
              ))}
            </ul>
          )}
            </div>
            <div className='chatuser'>
              {users.usernames.map((username, index) => (
                <div key={index} className="user-item">
                  {Cookies.get('username') === 'Gojo' ? <img src={seventh}></img>: <img src={gojo}></img>}
                  <button id='userchatbtn' onClick={async () => await handleChatonClick(participants[index])}>{username}</button>

                  
                {/* Ellipsis menu */}
      <div className="chat-options">
        <button className="ellipsis-button" onClick={() => toggleOptions(participants[index])}>
          &#x22EE; {/* Vertical Ellipsis */}
        </button>

        {showOptions === participants[index] && (
          <div className="chat-dropdown">
            <button onClick={async ()=> await handleDeleteChat(participants[index])}>Delete</button>
            {/* Add more options here if needed */}
          </div>
        )}
      </div>


                </div>
              ))}
             </div>
             </div>
            <div className='convo-detail'> 
            <div className='chatname'>
            {currentChat}
            {isTyping.userid === id && isTyping.TypingStatus === true ? '   ...Typing':''}
          </div>
            
             <div className="chatarea" ref={mssgref}>
  {convo.map((message, index) => {
    const isSent = message.sender === authdata.userid;
    const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const messageDate = new Date(message.timestamp).toLocaleDateString();
    const previousMessageDate =
      index > 0 ? new Date(convo[index - 1].timestamp).toLocaleDateString() : null;

    return (
      <React.Fragment key={message._id}>
        {/* Date Separator */}
        {index === 0 || messageDate !== previousMessageDate ? (
          <div className="date-separator">
            {messageDate}
          </div>
        ) : null}

        {/* Message */}
        {isSent ? (
          <div className="sendmssg">
            <div className="first-send">
              <div className="sendtime">{time}</div>
              <div className="sendpart">{message.text}</div>
              

                {/* Ellipsis menu */}
      <div className="message-options">
        <button className="ellipsis-button" onClick={() => toggleOptions(message._id)}>
          &#x22EE; {/* Vertical Ellipsis */}
        </button>

        {showOptions === message._id && (
          <div className="options-dropdown">
            <button onClick={async ()=> await handleDelete(message._id)}>Delete</button>
            {/* Add more options here if needed */}
          </div>
        )}
      </div>

              <div className="seen-status">{message.seen.status === true ? TimeMapping(message.seen.duration): "Sent"}</div>
            </div>
          </div>
        ) : (
          <div className="recvmssg">
            <div className="first-receive">
              <div className="recvtime">{time}</div>
              <div className="recvpart">{message.text}</div>
            </div>
          </div>
        )}
      </React.Fragment>
    );
  })}
</div>

          <div className='chatinput'>
            <div className='reaction'><img src={emoji} alt='Emoji'></img></div>
           <div className='chatmssg'><input type='text' id='mssg' onChange={handleInputChat} value={mssg.text}   placeholder='Text your friend'></input></div>
            {/* <button id='chatbtn' onClick={async() => await SubmitChat(id)}>Send</button> */}
            <div className='chatsend' onClick={async() => await SubmitChat(id)}><img src={send} alt='Send'></img></div>
          </div>
        </div>
        </div> 
      </>
    );
}

export default Chat;