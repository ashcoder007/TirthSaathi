require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

connectDB();

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(express.json());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// routes
app.use('/api/auth', require('./routes/auth'));

app.get('/', (req, res) => res.send('TirthSaathi backend running'));

// server.js (add below existing app.use lines)
app.use('/api/places', require('./routes/places'));

app.use('/api/ai', require('./routes/ai'));


const adminRouter = require('./routes/admin');
app.use('/api/admin', adminRouter);

app.use('/api/admin/events', require('./routes/adminEvents'));
app.use('/api/events', require('./routes/events'));
app.use("/api/accommodations", require("./routes/accommodations"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
