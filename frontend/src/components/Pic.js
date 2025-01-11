import React, { useContext, useState } from 'react';
import '../css_file/Post.css';
import Connect_Context from '../context/Connectcontext';

const Pic = ({ show, setShow, signdata }) => {
  const context = useContext(Connect_Context);
  const { cloudimage, authdata } = context;

  const [image, setImage] = useState(null); // State to store the image file
  const [PostImage, setPostImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.createRef(); // Ref for hidden file input
  const [desc, setdesc] = useState({text:'New Post'});

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
    formData.append('description', desc.text);
    formData.append('image', image); // Append the image

    setUploading(true);
    try {
      const result = await cloudimage(formData, authdata.authtoken); // Upload function
      console.log(result);

      if (result.success) {
        alert('Post uploaded');
        handleModal(); // Close modal after successful upload
      } else {
        alert('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert('There was an error uploading the image.');
    } finally {
      setUploading(false);
    }
  };

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
              <div className="description-label">Post Description:</div>
              <input id="modaldesc" placeholder="Enter your thoughts for your post" onChange={(e) => setdesc({...desc, text: e.target.value})} />
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
