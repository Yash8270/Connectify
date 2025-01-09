const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const User = require('../models/User');
const Post = require('../models/Post');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

const JWT_SECRET = '##########';

router.post('/postpic', fetchuser, upload.single('image'), async (req, res) => {
    try {
        const {description} = req.body;
        // console.log(req.body);
        // console.log(req.file);
        const imageUrl = req.file.path; // Cloudinary URL

        const postdata = await Post.create({
            description: description,
            image: imageUrl,
            userid: req.user.id
        });

        res.status(200).json({success: true, postdata});

    } catch(error) {
        console.log(error.message);
        return res.status(500).json({success: false, error:'Internal server error'});
    }
});

router.post('/getpost', fetchuser, async (req, res) => {
    try {
          const authid = req.user.id;
          const user_profile = await User.findById(authid);
        //   console.log(user_profile);

          const {fname} = req.body;
        //   console.log(fname);
          const following = await User.findOne({username: fname});

        //   console.log(following._id);

          const isfollow = user_profile.following.includes(following._id);

        //   console.log(isfollow);

          const following_post = await Post.find({userid: following._id});

          if(!isfollow) {
             return res.status(200).json({userid: following._id, message:"You don't follow the person"});
          }
         
          res.status(200).json(following_post);

    } catch(error) {
        console.log(error.message);
        return res.status(500).send('Internal server error');
    }

});


router.get('/selfpost', fetchuser, async (req, res) =>{
    try {
        const authid = req.user.id;

        const pics = await Post.find({userid: authid});
    
        if(!pics) {
            return res.send('No pics');
        }
        res.json(pics);

    } catch(error) {
        console.log(error.message);
        return res.status(500).send('Internal server error');
    }
});

router.delete('/delpost/:id', fetchuser, async (req, res) => {
    try {
        const picid = req.params.id;

        // console.log(picid);

        let pics = await Post.findById(picid);

        if(!pics) {
           return res.status(200).send('Pic not found');
        }

        pics = await Post.findByIdAndDelete(picid);

        res.json({"Success": "Pic deleted", "picture": pics});

    } catch(error) {
        console.log(error.message);
        return res.status(500).send('Internal server error');
    }

});

router.get('/getall', fetchuser, async (req, res) => {

    // console.log('During request: ',req.cookies);
    try {
        const authid = req.user.id;
        const following = await User.findById(authid).select('following');

        if(!following) {
           return res.send('No following');
        }

        let allpics = []; 

        const followingUsers = following.following; 
        
        allpics = await Promise.all(
          followingUsers.map(async (user) => {
            return await Post.find({ userid: user._id });
          })
        );
        
        allpics = allpics.flat();
        
        // console.log(allpics);
        res.json(allpics);

    } catch(error) {
        console.log(error.message);
        return res.status(500).send('Internal server error');
    }
    
});

router.patch('/like/:id',fetchuser, async (req, res) => {
    try {
          const authid = req.user.id;
          const postid = req.params.id;

          let posts = await Post.findById(postid);

          if(!posts) {
            return res.status(400).json({error:'Post is not present'});
          }
         
          posts = await Post.findByIdAndUpdate(
            postid,
            {$addToSet: {likes: authid}},
            {new: true}
          );
        
         res.status(200).json(posts);  

    } catch(error) {
        console.log(error.message);
        res.status(500).send('Internal server error');
    }
});

router.patch('/dislike/:id', fetchuser, async (req, res) => {
    try {
        const authid = req.user.id;
        const postid = req.params.id;

        let posts = await Post.findById(postid);

          if(!posts) {
            return res.status(400).json({error:'Post is not present'});
          }
         
          posts = await Post.findByIdAndUpdate(
            postid,
            {$pull: {likes: authid}},
            {new: true}
          );
        
         res.status(200).json(posts);  



    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal server error');
    }
});

router.patch('/comment/:id', fetchuser, async (req, res) => {
    try {
        const authid = req.user.id;
        const postid = req.params.id;
        const {text} = req.body;

        let findpost = await Post.findById(postid);

        if(!findpost) {
            return res.status(400).json({error:'Post not present'});
        }

        findpost = await Post.findByIdAndUpdate(
            postid,
            {$push: {comments: {
                userid: authid,
                text: text,
            },
        },
    },
            {new: true}
        );

        res.status(200).json(findpost);

    } catch(error) {
        console.log(error.message);
        res.status(500).send('Internal server error');
    }
});

router.get('/getcomment/:id', fetchuser, async (req, res) => {
    try {
        const postid = req.params.id;
        
        const comment = await Post.findById(postid).select('comments');

        if(!comment) {
            return res.status(400).json({error: 'No post is  found'});
        }

        const sortcomment = comment.comments.map((comments) => comments);

        return res.status(200).json(sortcomment);

    } catch(error) {
        console.log(error.message);
        res.status(500).send('Internal server error');
    }
});

router.patch('/reply/:id', fetchuser, async (req, res) => {
    try {
        const authid = req.user.id;
        const comment_id = req.params.id;

        const {text} = req.body;

        let comment = await Post.findOne(
            {'comments._id': comment_id},
            {'comments.$': 1}
        );

        if(!comment) {
            return res.status(400).json({error: 'Comment not found'});
        }

        comment = await Post.findOneAndUpdate(
            { 'comments._id': comment_id }, 
    {
        $push: {
            'comments.$.replies': { 
                text: text, 
                userid: authid
            }
        }
    },
    { new: true }  
            
        );

        return res.status(200).json(comment);
        
        

    } catch(error) {
        console.log(error.message);
        res.status(500).send('Internal server error');
    }
});


router.get('/getreply/:id', fetchuser, async (req, res) => {
    try {
        const authid = req.user.id;
        const comment_id = req.params.id;

        const comment = await Post.findOne(
            {'comments._id': comment_id},
            {'comments.$': 1}
        );

        if(!comment) {
            return res.status(400).json({error: 'Comment not found'});
        }

        const reply = await Post.findOne(
            {'comments._id': comment_id},
            {'comments.$': 1}
        ).then(doc => doc?.comments?.[0]?.replies);

        if(!reply) {
            return res.status(400).json({error: 'No replies to this comment'});
        }

        return res.status(200).json(reply);


    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
