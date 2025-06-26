const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
require("dotenv").config();
const connectDB = require("./Config/database");
const cors = require("cors");
const routers = require("./Routes/routers");
const cloudinaryStorage = require("./Config/cloudinary");
const fileupload = require("express-fileupload");
const router = require("./Routes/fileUpload");
const adminRouter = require("./Routes/admin");

// middleware to connect to the database
connectDB();
cloudinaryStorage();
app.use(fileupload({ useTempFiles: true }));
app.use(cors());
app.use(express.json());
app.use("/api/v1", routers);
app.use("/api/v1/fileUpload", router);
app.use("/api/v1/admin", adminRouter);

app.use(cookieParser());

// Serve static files from the 'public' directory

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/home", (req, res) => {
  res.send("Welcome to the Express.js server!");
});
