const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost:27017/connectify';

const connectToMongo =  () => {
    mongoose.connect(mongoURI)
    .then((success) => console.log("Mongodb connnected successfully " + success))
    .catch((err) => console.log(err.message));
 } 
 
 module.exports = connectToMongo;

 