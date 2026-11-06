const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const habitRoutes = require("./routes/habits");

const profileRoutes = require("./routes/profile");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to HabitForge API!"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "HabitForge server is running!"
  });
});

app.use("/api/profile", profileRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`HabitForge server running at http://localhost:${PORT}`);
  });
});

