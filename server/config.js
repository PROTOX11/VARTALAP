// server/config.js
module.exports = {
  SECRET_KEY: process.env.SECRET_KEY || 'aamkaachar', // Move to environment variable in production
  DB_URI: process.env.MONGODB_URI || 'mongodb+srv://prakash1142:9934202241@Preeti@cluster0.iyyun4h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0' // Use a secure password or remove fallback
};