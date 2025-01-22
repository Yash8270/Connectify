const mongoose = require('mongoose');
const {Schema} = mongoose;

const UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },
    
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],

    profilepic: {
        type: String,
        default:'https://res.cloudinary.com/dfmmmkwmk/image/upload/v1737535803/profilepick_ycnd6p.jpg'
    },

    bio: {
        type: String,
        default: 'User'
    },

    skills: [ {
        type: String,
        default:''
         
   }],

    followRequests: [
        {
          from: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
          status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
        },
      ]

});

module.exports = mongoose.model('User', UserSchema);
