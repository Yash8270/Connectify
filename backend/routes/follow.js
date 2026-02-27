const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const User = require('../models/User');
const Post = require('../models/Post');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



router.get('/selfreq', fetchuser, async (req, res) => {
    try {
        const authid = req.user.id;

        const user = await User.findById(authid).select('followRequests');
        const pendingRequests = user.followRequests.filter(request => request.status === 'pending');

        res.status(200).json(pendingRequests);

    } catch(error) {
        console.log(error.message);
        return res.status(500).send('Internal server error');
    }
});

router.get('/sentreq/:id', fetchuser, async (req, res) => {
    try {
        const authid = req.user.id;
        const fid = req.params.id;

        const user = await User.findOne({_id: fid,"followRequests.from": authid }).select('followRequests');

        if(!user) {
            return res.status(404).json({message: "User with followrequest not found"});
        }

        res.status(200).json(user);

    } catch(error) {
        console.log(error.message);
        return res.status(500).send('Internal server error');
    }
});

router.patch('/followreq/:name', fetchuser, async (req, res) => {

    console.log('Follow request');
    try {
        const authid = req.user.id;
        const fname = req.params.name;
    
        const user = await User.findOne({
            username: fname,
            "followRequests.from": authid,
            "followRequests.status": "pending",
          });
          

        if(user) {
            return res.status(200).json({message:'Follow request already sent'});
        }

        const updateuser = await User.findOneAndUpdate(
            {username: fname},
            {$push: {followRequests: {from:authid}}},
            {new: true}
        );

        res.status(200).json(updateuser);

    } catch (error) {
        console.log(error.message);
        return res.status(500).send('Internal server error');
    }
});

router.patch('/rejectreq/:id', fetchuser, async (req, res) => {
    try  {
        const authid = req.user.id;
        const fid = req.params.id;

        const user = await User.findOneAndUpdate(
            { _id: authid, "followRequests.from": fid },
            { $set: { "followRequests.$.status": 'rejected' } }
          );

          res.status(200).json(user);

    } catch(error) {
        console.log(error.message);
        return res.status(500).send('Internal server error');
    }

});

router.patch('/addfollower/:id', fetchuser, async (req, res) => {
    try {
        const fid = req.params.id;
        const authid = req.user.id;

        const updateuser = await User.findOneAndUpdate(
            { _id: authid, "followRequests.from": fid },
            { $set: { "followRequests.$.status": 'accepted' },
             $addToSet: {followers: fid}},
          );

        const update_followerside = await User.findByIdAndUpdate(
            fid,
            {$addToSet: {following: authid}},
            {new: true}
        );

        res.status(200).json(updateuser);

    } catch(error) {
        console.log(error.message);
        return res.status(500).send('Internal server error');
    }
});

router.patch('/removefollower/:id', fetchuser, async (req, res) => {
    try {
        const fid = req.params.id;
        const authid = req.user.id;

        const updateuser = await User.findByIdAndUpdate(
            authid,
            {$pull: {followers: fid}},
            {new: true}
        );

        const update_followerside = await User.findByIdAndUpdate(
            fid,
            {$pull: {following: authid}},
            {new: true}
        );

        res.json(updateuser);

    } catch(error) {
        console.log(error.message);
        return res.status(500).send('Internal server error');
    }
});


router.get('/allfollowing', fetchuser, async (req, res) => {
   try {
    const authid = req.user.id;

    const following = User.findById(authid).select('Following');

    res.status(200).json(following);

   } catch(error) {
    console.log(error.message);
    return res.status(500).send('Internal server error');
   } 
});

router.patch('/unfollow/:id', fetchuser, async (req, res) => {
    try {
        const fid = req.params.id;
        const authid = req.user.id;

        const updateuser = await User.findByIdAndUpdate(
            authid,
            {$pull: {following: fid}},
            {new: true}
        );

        const update_followingside = await User.findByIdAndUpdate(
            fid,
            {$pull: {followers: authid, followRequests: {from: authid}}},
            {new: true}
        );

        res.json(updateuser);

    } catch(error) {
        console.log(error.message);
        return res.status(500).send('Internal server error');
    }
});

router.get('/followingpic', fetchuser, async (req, res) => {
    try {
        const authid = req.user.id;

        const user = await User.findById(authid).populate({
            path: 'following',
            select: 'profilepic username',
          });
      
          if (!user) {
            throw new Error('User not found');
          }
      
          const followingWithProfilePics = user.following.map(followingUser => ({
            username: followingUser.username,
            profilepic: followingUser.profilepic,
          }));
      
          res.json(followingWithProfilePics);

    } catch(error) {
        console.log(error.message);
        return res.status(500).send('Internal server error');
    }
});

// ✅ FIXED: now returns _id and filters out users you've already requested
router.get('/nfback', fetchuser, async (req, res) => {
    try {
        const authid = req.user.id;

        const user = await User.findById(authid)
          .populate({
            path: 'followers',
            // ✅ We MUST select followRequests so we can check if a request was already sent
            select: 'profilepic username _id followRequests', 
          })
          .select('following followers');

        if (!user) {
          throw new Error('User not found');
        }

        // ✅ Filter out followers who we already follow OR have already requested
        const nonFollowedBackFollowers = user.followers.filter((follower) => {
            const isNotFollowing = !user.following.map(id => id.toString()).includes(follower._id.toString());
            
            // Check if current user (authid) has a pending request in the follower's followRequests array
            const hasPendingRequest = follower.followRequests && follower.followRequests.some(
                (req) => req.from.toString() === authid.toString() && req.status === 'pending'
            );

            return isNotFollowing && !hasPendingRequest;
        });

        // Return clean data to frontend
        const followersWithProfilePics = nonFollowedBackFollowers.map((follower) => ({
          _id: follower._id,
          username: follower.username,
          profilepic: follower.profilepic,
        }));

        res.json(followersWithProfilePics);

    } catch(error) {
        console.log(error.message);
        return res.status(500).send('Internal server error');
    }
});

module.exports = router;