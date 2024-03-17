import "dotenv/config";
import express from "express";
import morgan from "morgan";
import colors from "colors";
import cors from "cors";

// Import files
import connectToDataBase from "./config/db.js";

// Connect to Database
connectToDataBase();

// Create an app
const app = express();

// Add Body Parser
app.use(express.json());

// Logs middleware
if(process.env.NODE_ENV = "development") {
  app.use(morgan("combined"));
}

// Enable cors
app.use(cors());

// Routes
app.get("/", (req, res, next) => {
  res.status(200).json({ success: true, statusCode: 200, message: "Welcome to TuneCraft. Let's generate some music.", });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ success: false, statusCode: status, message: message, data: data });
});

// Port
const PORT = process.env.PORT || 8081;

// Server
const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});

// Handling Error
process.on("unhandledRejection", err => {
  console.log(`An error occurred: ${err.message}`);
  server.close(() => process.exit(1));
})
