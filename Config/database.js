const mongoose = require("mongoose");

const connectDB = async () => {
  mongoose
    .connect(process.env.DATABASE_URL)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err);
      exit(1);
    });
};

module.exports = connectDB;
