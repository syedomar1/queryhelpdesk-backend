// setupTestUsers.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { User , Ticket } = require('./models'); // Import the User model

// MongoDB connection
mongoose.connect(process.env.ATLASDB_URL);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  
  // Clear the User collection
  await User.deleteMany({});
  await Ticket.deleteMany({});
  console.log('Cleared existing users');

  // Create test users and admins
  const testUsers = [
    { name: 'testuser1', email: 'testuser1@example.com', password: 'password1', role: 'user', username: 'testuser1' },
    { name: 'testadmin1', email: 'testadmin1@example.com', password: 'password2', role: 'admin', username: 'testadmin1' },
  ];

  for (const userData of testUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = new User({ ...userData, password: hashedPassword });
    await newUser.save();
  }

  console.log('Test users and admins created');
  process.exit(0); // Exit the script
});
