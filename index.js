const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const { User, Ticket } = require('./models'); // Import models
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// MongoDB connection
mongoose.connect(process.env.ATLASDB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://queryhelpdesk-frontend.vercel.app',
  ],
  optionsSuccessStatus: 200,
}));

app.use(bodyParser.json());

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    console.log(user); // Log user object to see if it exists

    if (!user) {
      console.log(`No user found with email: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Await the bcrypt.compare promise to resolve before logging and making a decision
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(isPasswordValid); // Log the result of the password comparison

    if (!isPasswordValid) {
      console.log('Password comparison failed');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Password comparison succeeded');
    res.json({ message: 'Logged in successfully' });
  } catch (error) {
    console.error(`Error during login: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/signup', async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, email, password: hashedPassword, role });
  await newUser.save();
  res.status(201).json({ message: 'User registered successfully' });
});

app.get('/api/user', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Here you would normally verify the token and fetch the user
  // For simplicity, let's assume a dummy user for a valid token 'dummy-token'
  if (token === 'dummy-token') {
    const user = { id: 1, name: 'John Doe', email: 'john.doe@example.com' }; // Replace with real user data
    return res.json(user);
  } else {
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

app.post('/api/tickets', async (req, res) => {
  const newTicket = new Ticket(req.body);
  await newTicket.save();
  res.status(201).send('Ticket created');
});

app.get('/api/tickets', async (req, res) => {
  const tickets = await Ticket.find();
  res.json(tickets);
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
