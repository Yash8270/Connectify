import React from "react";

const Update = ({ showreq, setshowreq, reqname }) => {
  if (!showreq) return null;

  const closeModal = () => setshowreq(false);

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

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {reqname?.usernames?.length > 0 ? (
            reqname.usernames.map((u, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between pb-3 border-b border-white/10"
              >
                <span className="text-gray-200">{u}</span>

                <div className="flex">
                  <button className="bg-yellow-400 text-black px-3 py-1 rounded-l-md font-semibold hover:bg-yellow-300">
                    Accept
                  </button>
                  <button className="bg-black text-white px-3 py-1 rounded-r-md border border-white/10 hover:bg-white/10">
                    Reject
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-400 text-center py-4">
              No requests found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Update;
