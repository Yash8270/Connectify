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
    folder: 'uploads',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const upload = multer({ storage });

// ✅ ENV-AWARE COOKIE OPTIONS
// sameSite:'None' + secure:true  → required for cross-origin in production (HTTPS)
// sameSite:'Lax'  + secure:false → required for localhost (HTTP)
// Using 'None' on localhost HTTP causes the browser to SILENTLY DROP the cookie → every request 401
const isProduction = process.env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'None' : 'Lax',
  maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
};

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
    if (req.file && req.file.path) {
      imageUrl = req.file.path;
    }

    let user_email = await User.findOne({ email: req.body.email });
    let user_name = await User.findOne({ username: req.body.username });

    if (user_email || user_name) {
      return res.json({ error: "User already exist" });
    }

    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);

    const skillsArray = Array.isArray(skill)
      ? skill
      : skill?.split(',').map(s => s.trim()) || [];

    let new_user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: secPass,
      profilepic: imageUrl,
      bio: req.body.bio,
      skills: skillsArray
    });

    const user_id = { user: { id: new_user.id } };
    const jwtData = jwt.sign(user_id, JWT_SECRET);

    // ✅ Set HttpOnly cookies on sign-up too
    res.cookie('auth-token', jwtData, cookieOptions);
    res.cookie('userid', new_user.id, cookieOptions);

    res.status(200).json({ authtoken: jwtData, userid: new_user.id, user_detail: new_user, profilepic: imageUrl });

  } catch (error) {
    console.log("signin error:", error.message);
    return res.status(500).send("Internal server error");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Request Body:", req.body);

    let user_name = await User.findOne({ username: req.body.username });

    if (!user_name) {
      return res.status(401).json({ error: "User does not exists", value: 0 });
    }

    const passCompare = await bcrypt.compare(password, user_name.password);

    if (!passCompare) {
      return res.status(401).json({ error: "Incorrect password", value: 0 });
    }

    const user_id = { user: { id: user_name.id } };
    const jwtData = jwt.sign(user_id, JWT_SECRET);

    // ✅ Use shared cookieOptions — Lax on localhost, None+Secure in production
    res.cookie('auth-token', jwtData, cookieOptions);
    res.cookie('userid', user_name.id, cookieOptions);

    res.status(200).json({ authtoken: jwtData, userid: user_name.id, user_detail: user_name });

  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Internal Server error");
  }
});

// ✅ AUTO-LOGIN: Verify existing HttpOnly cookie and return user data
// Called by frontend on every page load to silently restore session
router.get("/me", fetchuser, async (req, res) => {
  try {
    const uid = req.user.id;
    const user = await User.findById(uid);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const user_id = { user: { id: user.id } };
    const jwtData = jwt.sign(user_id, JWT_SECRET);

    // Refresh cookies so active sessions stay alive
    res.cookie('auth-token', jwtData, cookieOptions);
    res.cookie('userid', user.id, cookieOptions);

    return res.status(200).json({
      authtoken: jwtData,
      userid: user.id,
      user_detail: user,
    });

  } catch (error) {
    console.log("/me error:", error.message);
    return res.status(401).json({ error: "Invalid session" });
  }
});

router.get("/userinfo/:id", fetchuser, async (req, res) => {
  try {
    const uid = req.params.id;
    const user_detail = await User.findById(uid);

    if (!user_detail) {
      return res.status(404).json({ error: "User not found" });
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
    const users = await User.find({ _id: { $in: ids } }).select('username _id');
    const idToUserMap = new Map(users.map(user => [user._id.toString(), user.username]));
    const usernames = ids.map(id => idToUserMap.get(id));
    res.status(200).json({ usernames });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Internal server error');
  }
});

module.exports = router;