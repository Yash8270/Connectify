const mongoose = require('mongoose');
const { Schema } = mongoose;

const ChatSchema = new Schema({
  participants: [
    {
     userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
     },
     profilepic: {
      type: String,
      default:'https://res.cloudinary.com/dfmmmkwmk/image/upload/v1737535803/profilepick_ycnd6p.jpg'
     }
    },
  ],
  messages: [
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      seen : {
          status: {
            type: Boolean,
            default: false,
          },
          duration: {
            type: Date,
            default: Date.now
          }       
      }
    },
  ]
});

module.exports = mongoose.model('Chat', ChatSchema);
