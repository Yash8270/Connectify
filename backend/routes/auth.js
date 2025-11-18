const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require('../middleware/fetchuser');


const JWT_SECRET = process.env.JWT_SECRET;

require('dotenv').config();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'], // Allowed file types
  },
});

const upload = multer({ storage }); 

router.get("/all", fetchuser, async (req, res) => {
  try {

    const allusers = await User.find().select('username');

    return res.status(200).json(allusers);

  } catch(error) {
    console.log(error.message);
    return res.status(500).send('Internal server error');
  }
});

router.post("/signin", upload.single('profilepic'), async (req, res) => {
  try {
    const { username, email, password, bio, skill } = req.body;
    console.log(req.body);
    let imageUrl = '';
    if(req.file.path) {
       imageUrl = req.file.path;
    }
  
    console.log(username);
    
    let user_email = await User.findOne({ email: req.body.email });
    let user_name = await User.findOne({ username: req.body.username });

    if (user_email || user_name) {
      return res.json({ error: "User already exist" });
    }

    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);
    console.log(secPass);

    const skillsArray = Array.isArray(skill)
      ? skill // If it's already an array, use it as is
      : skill?.split(',').map(s => s.trim()) || []; // Otherwise, split the string and trim whitespace

    let new_user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: secPass,
      profilepic: imageUrl,
      bio: req.body.bio,
      skills: skillsArray
    });

    const user_id = {
      user: {
        id: new_user.id,
      },
    };

    const jwtData = jwt.sign(user_id, JWT_SECRET);
    console.log(jwtData);
    res.status(200).json({ authtoken: jwtData , userid: user_id.user.id, user_detail: new_user, profilepic: imageUrl});
  } catch (error) {
    console.log(error.message);
    const { username, email, password, bio, skill } = req.body;
    console.log(req.body);
    // let imageUrl = '';
    // if(req.file.path) {
    //    imageUrl = req.file.path;
    // }
    // else {
    // }
    console.log(username);
    
    let user_email = await User.findOne({ email: req.body.email });
    let user_name = await User.findOne({ username: req.body.username });

    if (user_email || user_name) {
      return res.json({ error: "User already exist" });
    }

    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);
    console.log(secPass);

    const skillsArray = Array.isArray(skill)
      ? skill // If it's already an array, use it as is
      : skill?.split(',').map(s => s.trim()) || []; // Otherwise, split the string and trim whitespace

    let new_user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: secPass,
      bio: req.body.bio,
      skills: skillsArray
    });

    const user_id = {
      user: {
        id: new_user.id,
      },
    };

    const jwtData = jwt.sign(user_id, JWT_SECRET);
    console.log(jwtData);
    res.status(200).json({ authtoken: jwtData , userid: user_name.id, user_detail: new_user, profilepic: default_pic});
    // return res.status(500).send("Internal server error");
  } 
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    let user_name = await User.findOne({ username: req.body.username });

    if (!user_name) {
      return res.status(401).json({error: "User does not exists", value:0});
    }

    const passCompare = await bcrypt.compare(password, user_name.password);

    if (!passCompare) {
      return res.status(401).json({error: "Incorrect password", value:0});
    }

    const user_id = {
      user: {
        id: user_name.id,
      },
    };
    // console.log(user_name.id);
    const jwtData = jwt.sign(user_id, JWT_SECRET);
    
    res.cookie('auth-token', jwtData, {
      httpOnly: true,  // Prevent access from JavaScript
      secure: process.env.NODE_ENV === 'production',  // Only set to true in production (ensure HTTPS)
      sameSite: 'None',  // Allow cross-site requests
      maxAge: 1 * 24 * 60 * 60 * 1000,  // 7 days expiration
    });
    
    res.cookie('userid', user_name.id, {
      httpOnly: true,  // Prevent access from JavaScript
      secure: process.env.NODE_ENV === 'production',  // Only set to true in production (ensure HTTPS)
      sameSite: 'None',  // Allow cross-site requests
      maxAge: 1 * 24 * 60 * 60 * 1000,  // 7 days expiration
    }); 

    res.status(200).json({ authtoken: jwtData , userid: user_name.id, user_detail: user_name});
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Internal Server error");
  }
});

router.get("/userinfo/:id", fetchuser, async (req, res) => {
  try {

    const uid = req.params.id;

    const user_detail = await User.findById(uid);

    if(!user_detail) {
      return res.status(404).json({error: "USer not found"});
    }

    res.status(200).json(user_detail);

  } catch(error) {
    console.log(error.message);
    return res.status(500).send('Internal server error');
  }
});


router.post("/idtouser", async (req, res) => {
  try {
    const { ids } = req.body;

    // Fetch users whose IDs are in the array
    const users = await User.find({ _id: { $in: ids } }).select('username _id');

    // Map the results to the order of the input IDs
    const idToUserMap = new Map(users.map(user => [user._id.toString(), user.username]));
    const usernames = ids.map(id => idToUserMap.get(id)); // Order according to the input IDs

    res.status(200).json({ usernames });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Internal server error');
  }
});


module.exports = router;