// server/config.js
module.exports = {
  SECRET_KEY: process.env.SECRET_KEY || 'aamkaachar', // Move to environment variable in production
  DB_URI: process.env.MONGODB_URI || 'mongodb+srv://prakash1142:H49UbrhlzOrUFdeR@cluster0.iyyun4h.mongodb.net/vartalap?retryWrites=true&w=majority&appName=Cluster0'
}