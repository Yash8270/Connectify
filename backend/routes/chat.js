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

        if (!recdata) {
            return res.status(404).json({ message: "Recipient user not found" });
        }

        const connection = await User.findOne({ _id: sendid, following: recid });

        if (!connection) {
            return res.status(400).json({ message: "You don't follow this account" });
        }

        const chatcheck = await Chat.findOne({
            participants: { $all: [{ $elemMatch: { userid: sendid } }, { $elemMatch: { userid: recid } }] }
        });

        if (chatcheck) {
            const updation = await Chat.findOneAndUpdate(
                { participants: { $all: [{ $elemMatch: { userid: sendid } }, { $elemMatch: { userid: recid } }] } },
                {
                    $push: {
                        messages: {
                            sender: sendid,
                            text: mssg,
                            timestamp: new Date()
                        }
                    }
                },
                { new: true }
            );
            return res.status(200).json(updation);
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
            return res.status(404).json({ error: "No existing conversation found. Start a new chat first." });
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
            return res.status(200).json({ exists: false, messages: null });
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
            return res.status(200).json({ success: false, message: 'No chats found' });
        }

        let isUpdated = false;

        findchat.messages.forEach((message) => {
            if (!message.seen.status && message.sender.toString() !== sendid.toString()) {
                message.seen.status = true;
                message.seen.duration = req.body.stamp || new Date();
                isUpdated = true;
            }
        });

        if (isUpdated) {
            await findchat.save();
        }
        
        res.status(200).json({ success: true, message: 'Messages marked as seen' });

    } catch (error) {
        console.log("chatseen error:", error.message);
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
            return res.status(200).json({ success: false, message: 'Chat does not exist' });
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
            .sort({ updatedAt: -1 });

        if (!chats.length) {
            return res.status(200).json([]);
        }

        const otherParticipants = chats.flatMap(chat =>
            chat.participants.filter(p => p.userid.toString() !== authid.toString())
        );

        const uniqueMap = new Map();
        otherParticipants.forEach(p => {
            if (!uniqueMap.has(p.userid.toString())) {
                uniqueMap.set(p.userid.toString(), p);
            }
        });

        const uniqueParticipants = Array.from(uniqueMap.values());
        const userIds = uniqueParticipants.map(p => p.userid);
        const users = await User.find({ _id: { $in: userIds } }).select('username profilepic _id');

        const userMap = new Map(users.map(u => [u._id.toString(), u]));

        // ✅ FIX: Calculate hasUnseen for each user natively
        const enriched = uniqueParticipants.map(p => {
            const user = userMap.get(p.userid.toString());
            const chat = chats.find(c => c.participants.some(pt => pt.userid.toString() === p.userid.toString()));
            
            let hasUnseen = false;
            if (chat && chat.messages) {
                // If there's any message from the OTHER person that is NOT seen
                hasUnseen = chat.messages.some(m => m.sender.toString() !== authid.toString() && m.seen.status === false);
            }

            return {
                userid: p.userid,
                profilepic: p.profilepic || user?.profilepic,
                username: user?.username || 'Unknown User',
                hasUnseen: hasUnseen // Tell frontend if there are unread messages
            };
        });

        return res.status(200).json(enriched);
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