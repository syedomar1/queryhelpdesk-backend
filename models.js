const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  username: { type: String, unique: true }
});

const User = mongoose.model('User', userSchema);

const ticketSchema = new mongoose.Schema({
  ticketNumber: Number,
  userName: String,
  issue: String,
  solution: String,
  updatedBy: String,  // New field to track who updated the issue
  status: { 
    type: String, 
    enum: ['Not Viewed', 'In Progress', 'Resolved'], 
    default: 'Not Viewed' 
  }
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = { User, Ticket };