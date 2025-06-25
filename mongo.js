// mongo.js
const { MongoClient } = require('mongodb');
const { DB_URI } = require('./server/config');

let client;

async function connectToMongo() {
    try {
        client = new MongoClient(DB_URI);
        await client.connect();
        console.log('Connected to MongoDB Atlas');
        return client.db('myDatabase');
    } catch (error) {
        console.error('Error connecting to MongoDB Atlas:', error);
        throw error;
    }
}

function getDb() {
    if (!client) throw new Error('MongoDB client not initialized');
    return client.db('myDatabase');
}

module.exports = { connectToMongo, getDb };