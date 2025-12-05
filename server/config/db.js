const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const  connectDB = async () => {
  try {
    const connectionString = process.env.MONGO_URI;
    if (!connectionString) {
      throw new Error('MONGO_URI is not defined in .env');
    }
    await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4
    });
    console.log('MongoDB connected successfully ');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;