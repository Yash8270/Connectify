const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const User = require('../models/User');
const Chat = require('../models/Chat');

router.post('/newchat/:id', fetchuser, async (req, res) => {
    try {
        const recid = req.params.id;
        const sendid = req.user.id;
        const { mssg } = req.body;

        const userdata = await User.findById(sendid);
        const recdata = await User.findById(recid);
        const connection = await User.findOne({ _id: sendid, following: recid });

        if (!connection) {
            return res.status(400).json({ message: "You don't follow this account" });
        }

        const chatcheck = await Chat.findOne({
            participants: { $all: [{ $elemMatch: { userid: sendid } }, { $elemMatch: { userid: recid } }] }
        });

        if (chatcheck) {
            return res.status(400).send('You already have a chat');
        }

        const newchat = await Chat.create({
            participants: [
                { userid: sendid, profilepic: userdata.profilepic },
                { userid: recid, profilepic: recdata.profilepic }
            ],
            messages: [{
                sender: sendid,
                text: mssg,
                timestamp: new Date()
            }]
        });

        return res.status(200).json(newchat);

    } catch (error) {
        console.log("/newchat/:id", error.message);
        return res.status(500).send('Internal server error');
    }
});

router.patch('/updatechat/:id', fetchuser, async (req, res) => {
    try {
        const sendid = req.user.id;
        const recid = req.params.id;

        const chatcheck = await Chat.findOne({
            participants: { $all: [{ $elemMatch: { userid: sendid } }, { $elemMatch: { userid: recid } }] }
        });

        if (!chatcheck) {
            return res.status(200).send("You don't have any previous conversation");
        }

        const updation = await Chat.findOneAndUpdate(
            { participants: { $all: [{ $elemMatch: { userid: sendid } }, { $elemMatch: { userid: recid } }] } },
            {
                $push: {
                    messages: {
                        sender: sendid,
                        text: req.body.mssg,
                        timestamp: new Date()
                    }
                }
            },
            { new: true }
        );

        return res.status(200).json(updation);

    } catch (error) {
        console.log("updatechat/:id", error.message);
        return res.status(500).send('Internal server error');
    }
});

router.get('/getchat/:id', fetchuser, async (req, res) => {
    try {
        const sendid = req.user.id;
        const recid = req.params.id;

        const findchat = await Chat.findOne({
            participants: { $all: [{ $elemMatch: { userid: sendid } }, { $elemMatch: { userid: recid } }] }
        });

        if (!findchat) {
            return res.status(200).send("No chats found");
        }

        return res.status(200).json(findchat);

    } catch (error) {
        console.log(error.message);
        return res.status(500).send('Internal server error');
    }
});

router.patch('/chatseen/:id', fetchuser, async (req, res) => {
    try {
        const sendid = req.user.id;
        const recid = req.params.id;

        const findchat = await Chat.findOne({
            participants: { $all: [{ $elemMatch: { userid: sendid } }, { $elemMatch: { userid: recid } }] }
        });

        if (!findchat) {
            return res.status(200).send("No chats found");
        }

        findchat.messages.forEach((message) => {
            if (!message.seen.status) {
                message.seen.status = true;
                message.seen.duration = req.body.stamp || new Date();
            }
        });

        await findchat.save();
        res.status(200).json({ success: true, message: 'Messages marked as seen' });

    } catch (error) {
        console.log(error.message);
        return res.status(500).send('Internal server error');
    }
});

router.delete('/delchat/:id', fetchuser, async (req, res) => {
    try {
        const sendid = req.user.id;
        const recid = req.params.id;

        const findchat = await Chat.findOne({
            participants: { $all: [{ $elemMatch: { userid: sendid } }, { $elemMatch: { userid: recid } }] }
        });

        if (!findchat) {
            return res.status(200).send("Chat does not exist");
        }

        await Chat.findOneAndDelete({
            participants: { $all: [{ $elemMatch: { userid: sendid } }, { $elemMatch: { userid: recid } }] }
        });

        return res.status(200).json({ success: true, message: 'Deleted successfully' });

    } catch (error) {
        console.log(error.message);
        return res.status(500).send('Internal server error');
    }
});

router.get("/chatuser", fetchuser, async (req, res) => {
    try {
        const authid = req.user.id;

        const chats = await Chat.find({ participants: { $elemMatch: { userid: authid } } })
            .sort({ 'messages.timestamp': -1 });

        if (!chats.length) {
            return res.status(400).send({ error: "No chats found" });
        }

        const uniqueParticipants = [...new Map(
            chats.flatMap(chat => chat.participants.filter(p => p.userid.toString() !== authid))
                .map(p => [p.userid, p])
        ).values()];

        return res.status(200).json(uniqueParticipants);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error");
    }
});

router.get('/unseen', fetchuser, async (req, res) => {
    try {
        const authid = req.user.id;

        const chats = await Chat.find({
            participants: { $elemMatch: { userid: authid } },
            messages: {
                $elemMatch: {
                    "seen.status": false,
                    sender: { $ne: authid }
                }
            }
        });

        res.status(200).json({ unseenCount: chats.length });

    } catch (error) {
        console.log(error.message);
        return res.status(500).send('Internal server error');
    }
});

module.exports = router;
