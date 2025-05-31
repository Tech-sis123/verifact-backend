const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://Tech_sis:techSis123@verifact.pmichrn.mongodb.net/?retryWrites=true&w=majority&appName=verifact";

async function connectDB() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");
    return client.db("yourDatabaseName"); // Replace with your DB name
  } catch (err) {
    console.error("❌ Connection failed:", err);
    process.exit(1);
  }
}

module.exports = connectDB;