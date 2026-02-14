import React, { useContext, useState, useRef } from "react";
import Connect_Context from "../context/Connectcontext";
import { X, ImagePlus, Loader2, Trash2 } from "lucide-react";

const Post = ({ show, setShow }) => {
  const { cloudimage } = useContext(Connect_Context);

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
    setUploading(false);
  };

  /* ---------------- FILE SELECT ---------------- */
  const handleFileSelect = (e) => {
    const img = e.target.files[0];
    if (img) {
      setImage(img);
      setPreview(URL.createObjectURL(img));
    }
  };

  /* ---------------- REMOVE IMAGE ---------------- */
  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ---------------- POST TO CLOUDINARY ---------------- */
  const handlePost = async () => {
    if (!desc.trim() && !image) {
      alert("Please add a description or an image.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("description", desc);
    if (image) {
      formData.append("image", image);
    }

    try {
      // Calling the cloudimage function from context
      // Note: authdata is usually handled via cookies/credentials in Api.js
      const result = await cloudimage(formData);

      if (result) {
        // Success
        closeModal();
        // You might want to trigger a feed refresh here if you have a method for it
        window.location.reload(); // Simple reload to show new post, or use a context function to update 'posts' state
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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">

      {/* BACKDROP */}
      <div
        onClick={!uploading ? closeModal : undefined}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      ></div>

      {/* MODAL */}
      <div className="relative bg-[#1a1a1a] rounded-2xl w-full max-w-lg p-6 border border-white/10 shadow-2xl animate-scaleIn flex flex-col gap-4">

        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <h2 className="text-xl font-bold text-white">Create Post</h2>
          <button
            onClick={closeModal}
            disabled={uploading}
            className="text-gray-400 hover:text-white transition disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* DESCRIPTION INPUT */}
        <textarea
          className="w-full p-4 bg-[#111] rounded-xl text-white border border-white/10 
          focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none resize-none transition-all placeholder:text-gray-500"
          rows={4}
          placeholder="What's on your mind?"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          disabled={uploading}
        />

        {/* IMAGE PREVIEW AREA */}
        {preview ? (
          <div className="relative w-full h-56 rounded-xl overflow-hidden border border-white/10 group">
            <img src={preview} alt="preview" className="w-full h-full object-contain bg-black/50" />
            
            <button
              onClick={removeImage}
              disabled={uploading}
              className="absolute top-2 right-2 bg-black/60 hover:bg-red-500/80 text-white p-2 rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 disabled:hidden"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ) : (
          /* UPLOAD BUTTON (If no image) */
          <div 
            onClick={() => fileInputRef.current.click()}
            className={`cursor-pointer border-2 border-dashed border-white/10 hover:border-yellow-400/50 hover:bg-[#222] rounded-xl h-32 flex flex-col items-center justify-center gap-2 transition-all group ${uploading ? 'pointer-events-none opacity-50' : ''}`}
          >
            <div className="p-3 bg-[#2a2a2a] rounded-full group-hover:scale-110 transition-transform">
              <ImagePlus className="text-yellow-400" size={24} />
            </div>
            <span className="text-gray-400 text-sm font-medium group-hover:text-gray-200">Add Photo</span>
          </div>
        )}

        {/* HIDDEN INPUT */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* FOOTER ACTIONS */}
        <div className="pt-2">
          <button
            onClick={handlePost}
            disabled={uploading || (!desc.trim() && !image)}
            className={`w-full py-3 rounded-full font-bold flex items-center justify-center gap-2 transition-all
              ${uploading || (!desc.trim() && !image)
                ? "bg-[#333] text-gray-500 cursor-not-allowed" 
                : "bg-yellow-400 hover:bg-yellow-300 text-black shadow-[0_0_15px_rgba(250,204,21,0.3)]"
              }`}
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Posting...</span>
              </>
            ) : (
              "Post"
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Post;