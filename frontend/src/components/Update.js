import React, { useContext, useEffect, useState } from "react";
import Connect_Context from "../context/Connectcontext";

const Update = ({ showreq, setshowreq, reqname }) => {
  const { followreq, acceptreq, rejectreq } = useContext(Connect_Context);

  // Local copy of usernames so we don't need setreqname from parent
  const [localReqname, setLocalReqname] = useState({ usernames: [] });

  // Sync local state with incoming reqname whenever modal opens / reqname changes
  useEffect(() => {
    if (reqname && Array.isArray(reqname.usernames)) {
      setLocalReqname({ usernames: reqname.usernames });
    } else {
      setLocalReqname({ usernames: [] });
    }
  }, [reqname, showreq]);

  if (!showreq) return null;

  /* ---------------- CLOSE MODAL ---------------- */
  const closeModal = () => setshowreq(false);

  /* ---------------- ACCEPT REQUEST ---------------- */
  const handleAccept = async (id, username) => {
    try {
      await acceptreq(id);
      // Remove the accepted username from local list
      setLocalReqname((prev) => ({
        ...prev,
        usernames: prev.usernames.filter((u) => u !== username),
      }));
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  /* ---------------- REJECT REQUEST ---------------- */
  const handleReject = async (id, username) => {
    try {
      await rejectreq(id);
      // Remove the rejected username from local list
      setLocalReqname((prev) => ({
        ...prev,
        usernames: prev.usernames.filter((u) => u !== username),
      }));
      alert("Follow request rejected");
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade"
        onClick={closeModal}
      ></div>

      {/* MODAL */}
      <div className="relative bg-[#1a1a1a] rounded-xl w-[90%] max-w-md p-6 border border-white/10 shadow-2xl animate-scaleIn">
        {/* CLOSE BUTTON */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 text-gray-300 text-xl hover:text-red-500"
        >
          ✕
        </button>

        <div className="text-xl font-semibold mb-4 text-white">
          Follow Requests
        </div>

        {/* REQUEST LIST */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {localReqname.usernames.length > 0 ? (
            localReqname.usernames.map((username, index) => (
              <div
                key={index}
                className="flex items-center justify-between pb-3 border-b border-white/10"
              >
                <span className="text-gray-200">{username}</span>

                <div className="flex">
                  <button
                    className="bg-yellow-400 text-black px-3 py-1 rounded-l-md font-semibold hover:bg-yellow-300"
                    onClick={() =>
                      handleAccept(followreq?.[index]?.from, username)
                    }
                  >
                    Accept
                  </button>
                  <button
                    className="bg-black text-white px-3 py-1 rounded-r-md border border-white/10 hover:bg-white/10"
                    onClick={() =>
                      handleReject(followreq?.[index]?.from, username)
                    }
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-400 text-center py-4">
              No follow requests.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Update;
