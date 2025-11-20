const mongoose = require('mongoose');
console.log("DB FILE LOADED");  // ADD THIS

require('dotenv').config();

const mongoURI = process.env.MONGODB_URL;
console.log("MONGO URI FROM ENV:", mongoURI);  // ADD THIS

const connectToMongo = async () => {
  console.log("connectToMongo CALLED");  // ADD THIS
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected");

    mongoose.connection.on("connected", () => {
      console.log("Connected DB:", mongoose.connection.name);
    });

  } catch (err) {
    console.log("ERROR CONNECTING:", err.message);
  }
};

module.exports = connectToMongo;
