const mongoose = require('mongoose');
const { Schema } = mongoose;

const ChatSchema = new Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
