const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  firstName: {
    type: String,
    required: true,
    default: 'Admin'
  },
  lastName: {
    type: String,
    required: true,
    default: 'User'
  },

  notifications: [
    {
      message: String,
      isRead: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
  ],

  role: { 
    type: String, 
    enum: ['admin', 'super_admin'], 
    default: 'admin' 
  },

  isAvailable: {
    type: Boolean,
    default: true
  },

  lastAssigned: {
    type: Date,
    default: Date.now
  },

  gender: { 
    type: String, 
    required: true,
    enum: ['male', 'female'],
    lowercase: true,
    default: 'male'
  },

  photo: {
    type: String,
    default: function() {
      const id = Math.floor(Math.random() * 100);
      return `https://randomuser.me/api/portraits/${this.gender === 'male' ? 'men' : 'women'}/${id}.jpg`;
    }
  },

  activeChats: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
  
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin