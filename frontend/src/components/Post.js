import React, { useState } from "react";

const Post = ({ show, setShow }) => {
  const [preview, setPreview] = useState(null);
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);

  if (!show) return null;

  const closeModal = () => {
    setShow(false);
    setPreview(null);
    setDesc("");
    setFile(null);
  };

  const handleFile = (e) => {
    const img = e.target.files[0];
    setFile(img);
    if (img) setPreview(URL.createObjectURL(img));
  };

  const handlePostClick = () => {
    // 🔥 YOU WILL PUT YOUR ORIGINAL POST LOGIC HERE
    console.log("Posting:", desc, file);
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* BACKDROP */}
      <div
        onClick={closeModal}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade opacity-100"
      ></div>

      {/* MODAL */}
      <div className="relative bg-[#1a1a1a] rounded-xl w-[90%] max-w-md p-6 border border-white/10 shadow-2xl animate-scaleIn">

        {/* CLOSE BUTTON */}
        <button
          className="absolute top-3 right-3 text-gray-300 text-xl hover:text-red-500"
          onClick={closeModal}
        >
          ✕
        </button>

        <div className="text-xl font-semibold text-white mb-4">Create Post</div>

        {/* DESCRIPTION */}
        <label className="text-gray-300 text-sm">Description</label>
        <textarea
          className="w-full mt-1 mb-4 p-3 bg-[#242424] rounded-lg text-white border border-white/10 focus:ring-2 focus:ring-yellow-400 outline-none"
          rows={3}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        {/* IMAGE PREVIEW */}
        {preview && (
          <div className="w-full h-48 overflow-hidden rounded-lg border border-white/10 mb-4">
            <img src={preview} alt="preview" className="w-full h-full object-contain" />
          </div>
        )}

        {/* UPLOAD */}
        <label className="text-gray-300 text-sm mb-1 block">Upload Image</label>
        <input
          type="file"
          onChange={handleFile}
          className="text-gray-300 text-sm mb-4"
        />

        {/* POST BUTTON */}
        <button
          onClick={handlePostClick}
          className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-2 rounded-lg"
        >
          Post
        </button>
      </div>
    </div>
  );
};

export default Post;
