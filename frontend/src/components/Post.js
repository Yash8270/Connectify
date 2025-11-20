import React, { useContext, useState, useRef } from "react";
import Connect_Context from "../context/Connectcontext";

const Post = ({ show, setShow }) => {
  const { cloudimage, authdata } = useContext(Connect_Context);

  const [desc, setDesc] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  if (!show) return null;

  /* ---------------- CLOSE MODAL ---------------- */
  const closeModal = () => {
    setShow(false);
    setDesc("");
    setImage(null);
    setPreview(null);
  };

  /* ---------------- FILE SELECT ---------------- */
  const handleFileSelect = (e) => {
    const img = e.target.files[0];
    setImage(img);

    if (img) {
      setPreview(URL.createObjectURL(img));
    }
  };

  /* ---------------- TRIGGER HIDDEN INPUT ---------------- */
  const openFilePicker = () => {
    fileInputRef.current.click();
  };

  /* ---------------- POST TO CLOUDINARY ---------------- */
  const handlePost = async () => {
    if (!desc.trim()) {
      alert("Description cannot be empty.");
      return;
    }

    if (!image) {
      alert("Please upload an image.");
      return;
    }

    const formData = new FormData();
    formData.append("description", desc);
    formData.append("image", image);

    setUploading(true);

    try {
      const result = await cloudimage(formData, authdata.authtoken);

      if (result.success) {
        alert("Post uploaded successfully!");
        closeModal();
      } else {
        alert("Image upload failed!");
      }
    } catch (err) {
      console.error(err);
      alert("Error while uploading.");
    } finally {
      setUploading(false);
    }
  };

  /* ------------------------------------------------------ */
  /* ------------------------ UI -------------------------- */
  /* ------------------------------------------------------ */

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">

      {/* BACKDROP */}
      <div
        onClick={closeModal}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade"
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

        <div className="text-xl font-semibold text-white mb-4">
          Create Post
        </div>

        {/* DESCRIPTION */}
        <label className="text-gray-300 text-sm">Description</label>
        <textarea
          className="w-full mt-1 mb-4 p-3 bg-[#242424] rounded-lg text-white border border-white/10 
          focus:ring-2 focus:ring-yellow-400 outline-none"
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

        {/* HIDDEN FILE INPUT */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />

        {/* UPLOAD BUTTON */}
        <button
          className="w-full bg-[#333] hover:bg-[#444] text-gray-300 py-2 rounded-lg mb-3"
          onClick={openFilePicker}
        >
          {image ? "Change Image" : "Upload Image"}
        </button>

        {/* POST BUTTON */}
        <button
          onClick={handlePost}
          disabled={uploading}
          className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-2 rounded-lg"
        >
          {uploading ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
};

export default Post;
