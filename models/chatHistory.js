const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  from_user: {
    type: String,
    required: true
  },
  to_user: {
    type: [
      {
        type: String
      }
    ],
    required: true
  },
  room: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  date_sent: {
    type: Date,
    default: Date.now
  }
});

const chatHistory = mongoose.model('chatHistory', chatHistorySchema);
module.exports = chatHistory;
