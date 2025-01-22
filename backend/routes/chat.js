const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const User = require('../models/User');
const Post = require('../models/Post');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Chat = require('../models/Chat');

router.post('/newchat/:id', fetchuser, async (req, res) => {
    try {
        const recid = req.params.id;
        const sendid = req.user.id;
        const {mssg} = req.body;
        const userdata = await User.findById(req.user.id);
        const recdata = await User.findById(req.params.id);
        const connection = await User.findOne({_id: sendid, following: recid});

        if(!connection) {
            return res.status(400).json({message: "You don't follow this particular account"});
        }

        const chatcheck = await Chat.findOne({
            $and: [
              { "participants.userid": sendid },
              { "participants.userid": recid }
            ]
          });

        if(chatcheck) {
            return res.status(400).send('You already had chitchat with each other');
        }

        const newchat = await Chat.create({
            participants: [
                { userid: sendid, profilepic: userdata.profilepic },
                { userid: recid, profilepic: recdata.profilepic }
              ],
            messages: [{
                sender: sendid,
                text: mssg
            }]
        });

        return res.status(200).json(newchat);

    } catch(error) {
        console.log("/newchat/:id",error.message);
        return res.status(500).send('Internal server error');
    }
});


router.patch('/updatechat/:id', fetchuser, async (req, res) => {
    try {

        const sendid = req.user.id;
        const recid = req.params.id;

        const chatcheck = await Chat.findOne({
            $and: [
              { "participants.userid": sendid },
              { "participants.userid": recid }
            ]
          });

        if(!chatcheck) {
            return res.status(200).send("You don't have any old conversation");
        }

        const updation = await Chat.findOneAndUpdate(
            {participants:{
                $and:[{ "participants.userid": sendid },
                { "participants.userid": recid }
            ]}
        },
            {$push: {messages: [{sender: sendid, text: req.body.mssg}]}},
            {new: true}
        );

       return  res.status(200).json(updation);

    } catch(error) {
        console.log("updatechat/:id",error.message);
        return res.status(500).send('Internal server error');
    }
});

router.get('/getchat/:id', fetchuser, async (req, res) => {
    try {
        const sendid = req.user.id;
        const recid = req.params.id;

        const findchat = await Chat.findOne({
            $and: [
              { "participants.userid": sendid },
              { "participants.userid": recid }
            ]
          });

        if(!findchat) {
            return res.status(200).send("There are no chats");
        }

        return res.status(200).json(findchat);

    } catch(error) {
        console.log(error.message);
        return res.status(500).send('Internal server error');
    }
});

router.patch('/chatseen/:id', fetchuser, async (req, res) => {
    try {
        const sendid = req.user.id;
        const recid = req.params.id;
 
        const findchat = await Chat.findOne({
            $and: [
              { "participants.userid": sendid },
              { "participants.userid": recid }
            ]
          });

        if(!findchat) {
            return res.status(200).send("There are no chats");
        }

        const lastMessage = findchat.messages[findchat.messages.length - 1];

    if (!lastMessage) {
      return res.status(204).json({ error: 'No messages found in this chat' });
    }

    if(lastMessage.seen.status) {
        return res.status(200).json({message:'Already seen'});
    }

    findchat.messages.forEach((message) => {
        if (!message.seen.status) { // Only update unseen messages
            message.seen.status = true;
            message.seen.duration = req.body.stamp; // Use provided stamp or current time
        }
    });
    await findchat.save();

    console.log("Chats are in a seen zone");
    res.status(200).json({ success: true, message: 'Last message marked as seen' });


    } catch(error) {
        console.log(error.message);
        return res.status(500).send('Internal server error');
    }
});

router.delete('/delchat/:id', fetchuser, async (req, res) => {
    try {
        const sendid = req.user.id;
        const recid = req.params.id;

        const findchat = await Chat.findOne({
            $and: [
              { "participants.userid": sendid },
              { "participants.userid": recid }
            ]
          });

        if(!findchat) {
            return res.status(200).send("Chat doesn't exists");
        }

        const del = await Chat.findOneAndDelete(
            {participants: {$all: [sendid, recid]}}
        );
        
        // console.log(del);
        return res.status(200).json({success: true, message:'Deleted successfully'});
        
    } catch(error) {
        console.log(error.message);
        return res.status(500).send('Internal server error');
    }
});

router.patch('/delmssg/:id', fetchuser, async (req, res) => {
    try {
        const mssgid = req.params.id;

        const updatedChat = await Chat.findOneAndUpdate(
            { "messages._id": mssgid }, // Find the chat containing the message
            { $pull: { messages: { _id: mssgid } } }, // Remove the message
            { new: true } // Return the updated document
          );

       res.status(200).json(updatedChat);   

    } catch(error) {
        console.log(error.message);
        return res.status(500).send('Internal server error');
    }
});

router.get('/chatuser', fetchuser, async (req, res) => {
    try {
        const authid = req.user.id;

        const chats = await Chat.find({ participants:{userid: authid }}).sort({ 'messages.timestamp': -1 });

        if(!chats) {
            return res.status(400).send({error: 'Chats not found with your id'});
        }

        const participant_list = chats.map((chat) => chat.participants.filter((participant) => participant.userid.toString() !== authid));
        const uniqueParticipants = [...new Set(participant_list.flat().map((p) => p.toString()))];
        return res.status(200).json(uniqueParticipants);
        

    } catch(error) {
        console.log(error.message);
        res.status(500).send('Internal server error');
    }
});


router.get('/unseen', fetchuser, async(req, res) => {
    try {
        const authid = req.user.id;

        const chats = await Chat.find({
            participants: {userid:authid}, // The user is a participant
            messages: {
              $elemMatch: {
                "seen.status": false, // At least one message is unseen
                sender: { $ne: authid }, // Message was not sent by the user
              },
            },
          });

          res.status(200).json(chats.length);

    } catch(error) {
        console.log(error.message);
        return res.status(500).send('Internal server error');
    }
});


module.exports = router;