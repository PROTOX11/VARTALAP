// server/serverapp.js
const express = require("express");
const cors = require('cors');
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const { connectToMongo, getDb } = require('./mongo'); // Relative path from server

const app = express();
let db;

const PORT = process.env.PORT || 4500;

async function startServer() {
  try {
    db = await connectToMongo();
    app.use(cors({
      origin: 'https://vartalap.vercel.app',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true
    }));
    app.use(morgan("dev"));
    app.use(cookieParser());
    app.use(express.json());
    app.use(session({
      key: "user_sid",
      secret: process.env.SECRET_KEY || 'aamkaachar',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      }
    }));
    app.use("/api/v1/user", require('./routes/userRoutes'));

    app.get('/logout', (req, res) => {
      if (req.session.user) {
        req.session.destroy();
        res.clearCookie('user_sid');
        res.redirect('/');
      } else {
        res.redirect('/Logged');
      }
    });

    app.listen(PORT, () => console.log(`Server on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});