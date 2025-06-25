const mongoose = require('mongoose');
const { DB_URI } = require('./config');

async function connectToMongo() {
    console.log("📦 DB_URI from config.js:", DB_URI); // Add this line for debugging

    try {
        await mongoose.connect(DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB Atlas with Mongoose');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
}

module.exports = { connectToMongo };
