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

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ message: 'Logged in successfully' ,role:user.role,username: user.username});
  } catch (error) {
    console.error(`Error during login: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/signup', async (req, res) => {
  const { name, email, password, username, role = 'user' } = req.body;
  
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }

  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    return res.status(400).json({ message: 'User with this username already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, email, password: hashedPassword, username, role });
  await newUser.save();
  
  res.status(201).json({ message: 'User registered successfully', role: newUser.role ,username: user.username});
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
  const { ticketNumber, userName, issue } = req.body;

  // Ensure the ticketNumber and userName are provided
  if (!ticketNumber || !userName || !issue) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const newTicket = new Ticket({ ticketNumber, userName, issue });
    await newTicket.save();
    res.status(201).json(newTicket); // Respond with the created ticket
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/api/tickets', async (req, res) => {
  const { userName } = req.query;
  try {
    const query = userName ? { userName } : {};  // Filter by username if provided
    const tickets = await Ticket.find(query);
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/tickets/delete', async (req, res) => {
  const { userName, ticketNumber } = req.body;

  if (!userName || !ticketNumber) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await Ticket.deleteOne({ userName, ticketNumber });
    res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/tickets/update', async (req, res) => {
  const { ticketNumber, userName, solution, status, updatedBy } = req.body;

  if (!ticketNumber || !userName || status === undefined || updatedBy === undefined) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const ticket = await Ticket.findOne({ ticketNumber, userName });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.solution = solution || ticket.solution;  // Update solution if provided
    ticket.status = status;  // Update status
    ticket.updatedBy = updatedBy;  // Track who updated the ticket
    await ticket.save();

    res.status(200).json({ message: 'Ticket updated successfully' });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
