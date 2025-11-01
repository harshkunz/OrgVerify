const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['Admin', 'User']
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientModel'
  },
recipientModel: {
  type: String,
  enum: ['User','Admin'],
  required: true
},
  content: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
chatType: {
  type: String,
  enum: ['direct','support','group'],
  default: 'direct'
},
company: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Company',
  default: null
},
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);