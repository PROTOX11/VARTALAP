// Import the MongoClient class from the 'mongodb' package
const { MongoClient } = require('mongodb');

// MongoDB connection URI
const uri = 'mongodb://localhost:27017'; // Replace with your MongoDB URI

// Name of the database to connect to
const dbName = 'myDatabase'; // Replace with your database name

// Function to connect to MongoDB
async function connectToMongo() {
    // Create a new MongoClient instance
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB server
        await client.connect();

        console.log('Connected to MongoDB');

        // Get a reference to the database
        const database = client.db(dbName);

        // Perform operations with the database
        // (e.g., insert documents, query data)

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    } finally {
        // Close the connection when done
        await client.close();
        console.log('Disconnected from MongoDB');
    }
}

// Call the function to connect to MongoDB
connectToMongo();
