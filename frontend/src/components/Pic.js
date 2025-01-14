import React, { useContext, useState } from 'react';
import '../css_file/Post.css';
import Connect_Context from '../context/Connectcontext';

const Pic = ({ show, setShow, signdata }) => {
  const context = useContext(Connect_Context);
  const { cloudimage, authdata, signin } = context;

  const [image, setImage] = useState(null); // State to store the image file
  const [PostImage, setPostImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.createRef(); // Ref for hidden file input
  const [skill, setskill] = useState([]);
  const [bio, setbio] = useState('');

  // Close modal
  const handleModal = () => {
    setShow(false);
    setImage(null);
    setPostImage(null);
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImage(reader.result); // Set image preview
      };
      reader.readAsDataURL(file); // Read file as Data URL
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click(); // Trigger hidden file input click
  };

  // Upload image to Cloudinary
  const handlePost = async () => {
    const formData = new FormData();
    // formData.append('description', desc.text);
    formData.append('username', signdata.username);
    formData.append('email', signdata.email);
    formData.append('password', signdata.password);
    formData.append('bio', bio);
    formData.append('skill', skill);
    formData.append('profilepic', image); // Append the image

    setUploading(true);
    try {
      // const result = await cloudimage(formData, authdata.authtoken); // Upload function
      const result = await signin(formData);
      console.log(result);

      if (result.success) {
        alert('Successfully signin');
        handleModal(); // Close modal after successful upload
      } else {
        alert('failed');
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert('There was an error uploading the image.');
    } finally {
      setUploading(false);
    }
  };

  const updateskill = (index, value) => {
    const newskill = [...skill];
    newskill[index] = value;
    setskill(newskill); 

  }

  return (
    <>
      {show && (
        <div className="modal-container">
          {/* Modal Overlay */}
          <div className="modal-overlay"></div>

          {/* Modal Content */}
          <div className="modal-content">
            {/* Close Button */}
            <button className="close-btn" onClick={handleModal}>
              &times;
            </button>

            {/* Post Description */}
            <div className="modal-description">
              <div className="description-label">Enter your bio:</div>
              <input id="modaldesc" placeholder="Enter your thoughts for your post" onChange={(e) => setbio({...bio, value: e.target.value})} />
            </div>

            <div className="modal-description">
              <div className="description-label">Enter your top 5 skills</div>
              <input id="modaldesc" onChange={(e) => updateskill(0, e.target.value)} />
              <input id="modaldesc" onChange={(e) => updateskill(1, e.target.value)} />
              <input id="modaldesc" onChange={(e) => updateskill(2, e.target.value)} />
              <input id="modaldesc" onChange={(e) => updateskill(3, e.target.value)} />
              <input id="modaldesc" onChange={(e) => updateskill(4, e.target.value)} />
            </div>

            {/* Image Preview */}
            <div className="modal-upload">
              {image && (
                <div className="image-preview">
                  <img src={PostImage} alt="Uploaded Preview" />
                </div>
              )}
              <div className="post-label">Upload your post</div>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />

              {/* Buttons */}
              {image ? (
                <button id="cloudbtn" onClick={handlePost} disabled={uploading}>
                  {uploading ? 'Posting...' : 'Post'}
                </button>
              ) : (
                <button id="uploadbtn" onClick={handleButtonClick}>
                  Upload from your Computer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Pic;
