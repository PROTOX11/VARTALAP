
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';


const dbName = 'myDatabase'; 


async function connectToMongo() {
    
    const client = new MongoClient(uri);

    try {
        
        await client.connect();

        console.log('Connected to MongoDB');

        
        const database = client.db(dbName);

        
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    } finally {
        
        await client.close();
        console.log('Disconnected from MongoDB');
    }
}


connectToMongo();
