import React, { useContext, useEffect, useState } from 'react';
import interaction from '../assets/interaction.svg';
import '../css_file/Update.css';
import Connect_Context from '../context/Connectcontext';


const Update = ({showreq, setshowreq, reqname, setreqname}) => {

    const context = useContext(Connect_Context);
    const {authdata, followreq, setfollowreq, acceptreq, nfollow, idtouser, rejectreq} = context;


    const handleAccept = async (id, name) => {
        const addfollower = await acceptreq(id);
        console.log(addfollower);
        setreqname((prev) => ({
            ...prev,
            usernames: prev.usernames.filter((username) => username !== name)
        }));
    }

    const handleReject = async (id, name) => {
        const rejectfollowreq = await rejectreq(id);
        setreqname((prev) => ({
            ...prev,
            usernames: prev.usernames.filter((username) => username !== name)
        }));
        alert('Follow Request Rejected');
    }

    const handleModal = () => {
        setshowreq((prevShow) => !prevShow);
    }

    return(
        <>
      {showreq && (
         <div className="modal-overlay-req">
         <div className="modal-req">
           <button className="modal-close-req" onClick={handleModal}>
             &times;
           </button>
           <h2>Follow Requests</h2>
           {nfollow === 0 ? (
             <p>No follow requests.</p>
           ) : (
             <ul className="follow-requests-list">
               {reqname.usernames.map((request, index) => (
                 <li key={index} className="follow-request-item">
                   <span>{request}</span>
                   <div>
                     <button
                       className="accept-btn"
                       onClick={async () => await handleAccept(followreq[index].from, request)}
                     >
                       Accept
                     </button>
                     <button
                       className="reject-btn"
                       onClick={async () => await handleReject(followreq[index].from, request)}
                     >
                       Reject
                     </button>
                   </div>
                 </li>
               ))}
             </ul>
           )}
         </div>
       </div>
      )}  
      
        </>
    );
}

export default Update;