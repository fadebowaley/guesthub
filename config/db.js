const mongoose = require("mongoose");

// create a database as a single thread
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    
    await mongoose
      .connect(uri, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        poolSize: 10,
      })
      .catch((error) => console.log(error));
    const connection = mongoose.connection;
    console.log("Server db connected successfully");
  } catch (error) {
    console.log(error);
    return error;
  }
};


// Global connections to create and connect Database
const connectToDatabase = async () => {
  const uri = "mongodb://localhost/bags-ecommerce";
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      poolSize: 25,
    });
    console.log("Connected to database successfully!");
  } catch (error) {
    console.error("Error connecting to database:", error.message);
  }
};





const db =  mongoose.createConnection("mongodb://localhost:27017/bags-ecommerce", {
  useNewUrlParser: true,
});

module.exports = {
  connectDB, connectToDatabase,db
  };

