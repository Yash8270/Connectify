const mongoose = require('mongoose');
const { Schema } = mongoose;

const PostSchema = new Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },

    description: {
        type: String,
        required: true
    },

    image: {
        type: String,
        required: true
    },

    duration: {
        type: Date,
        default: Date.now
    },

    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User' 
        }
    ],

    comments: [
        {
            userid: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            text: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            replies: [
                {
                    userid: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'User', 
                        required: true
                    },
                    text: {
                        type: String,
                        required: true
                    },
                    createdAt: {
                        type: Date,
                        default: Date.now
                    }
                }
            ]
        }
    ]
});

module.exports = mongoose.model('Post', PostSchema);
