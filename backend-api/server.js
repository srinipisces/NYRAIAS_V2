require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cookieParser());
// ✅ Middleware
app.use(helmet());

const allowedOrigin = 'http://10.0.0.211'; // your frontend origin
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));

app.use(cookieParser());
app.use(bodyParser.json());

// 🔌 Connect to DB and then start server
pool.connect()
  .then(client => {
    client.release();
    console.log("✅ Connected to DB");
    console.log("inside users and trying to list all ----server.js");

    // 🔁 Routes
    app.use('/api/users', require('./users'));
    app.use('/api/suppliers', require('./suppliers'));
    app.use('/api/lab', require('./lab'));
    app.use('/api/materialinward', require('./materialinward'));
    app.use('/api/materialoutward', require('./materialoutward'));
    app.use('/api/kiln', require('./kiln'));
    app.use('/api/screening', require('./screening'));
    app.use('/api/stock', require('./stock'));
    app.use('/api/dashboard', require('./dashboard'));
    app.use('/api/reports', require('./reports'));
    app.use('/api', require('./index'));

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ Failed to connect to DB:", err.message);
    process.exit(1);
  });
