import React, { useContext, useState, useRef } from "react";
import Connect_Context from "../context/Connectcontext";
import { useNavigate } from "react-router-dom";

const Pic = ({ show, setShow, signdata }) => {
  const navigate = useNavigate();
  const { signin } = useContext(Connect_Context);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [skill, setSkill] = useState([]);
  const [bio, setBio] = useState({ text: "" });

  const fileInputRef = useRef(null);

  // Close modal
  const closeModal = () => {
    setShow(false);
    setImage(null);
    setPreview(null);
  };

  const updateSkill = (index, value) => {
    const newSkills = [...skill];
    newSkills[index] = value;
    setSkill(newSkills);
  };

  const onFileSelect = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => fileInputRef.current.click();

  const handlePost = async () => {
    const formData = new FormData();
    formData.append("username", signdata.username);
    formData.append("email", signdata.email);
    formData.append("password", signdata.password);
    formData.append("bio", bio.text);
    formData.append("skill", skill);
    formData.append("profilepic", image);

    setUploading(true);

    try {
      const result = await signin(formData);

      alert("Account created successfully!");
      closeModal();

      if (result && result.userid) {
        navigate(`/showcase/${result.userid}`);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong during sign-in");
    }

    setUploading(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">

      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn"
        onClick={closeModal}
      ></div>

      {/* MODAL BOX */}
      <div className="relative w-[95%] md:w-[450px] bg-[#222] text-white rounded-2xl border border-white/10 p-6 shadow-xl animate-scaleIn">

        {/* CLOSE BUTTON */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-4 text-gray-300 text-2xl hover:text-white transition"
        >
          ×
        </button>

        {/* TITLE */}
        <h1 className="text-xl font-semibold mb-4">Complete Your Profile</h1>

        {/* BIO */}
        <label className="text-gray-300 text-sm">Your Bio</label>
        <input
          className="w-full bg-[#2a2a2a] mt-1 px-4 py-2 rounded-lg border border-white/10 text-white outline-none focus:ring-2 focus:ring-yellow-400 transition"
          placeholder="Tell something about yourself..."
          onChange={(e) => setBio({ text: e.target.value })}
        />

        {/* SKILLS */}
        <div className="mt-4">
          <label className="text-gray-300 text-sm">Add your top 5 skills</label>
          <div className="grid grid-cols-1 gap-2 mt-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <input
                key={i}
                className="bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-white/10 outline-none focus:ring-2 focus:ring-yellow-400 transition"
                placeholder={`Skill ${i + 1}`}
                onChange={(e) => updateSkill(i, e.target.value)}
              />
            ))}
          </div>
        </div>

        {/* PREVIEW */}
        {preview && (
          <div className="mt-5 w-full flex justify-center">
            <img
              src={preview}
              alt="preview"
              className="w-32 h-32 rounded-full object-cover shadow-lg ring-4 ring-yellow-400"
            />
          </div>
        )}

        {/* UPLOAD BUTTONS */}
        <div className="mt-6 flex flex-col items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={onFileSelect}
          />

          {!image && (
            <button
              onClick={triggerUpload}
              className="w-full py-3 rounded-lg bg-[#333] text-gray-300 hover:bg-[#444] transition"
            >
              Upload Profile Picture
            </button>
          )}

          <button
            onClick={handlePost}
            disabled={uploading}
            className="w-full mt-3 py-3 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition disabled:bg-yellow-700"
          >
            {uploading ? "Signing in..." : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pic;
