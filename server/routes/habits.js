
const express = require("express");
const Habit = require("../models/Habit");
const User = require("../models/User");
const protect = require("../middleware/auth");

const router = express.Router();

router.use(protect);

// Get all habits
router.get("/", async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.userId }).sort({
      createdAt: -1
    });

    res.json({ success: true, habits });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch habits"
    });
  }
});

// Get current streak
router.get("/streak", async (req, res) => {
  try {
    const habits = await Habit.find({
      user: req.userId,
      isActive: true
    });

    const completedDays = new Set();

    habits.forEach((habit) => {
      habit.completedDates.forEach((date) => {
        completedDays.add(new Date(date).toLocaleDateString("en-CA"));
      });
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let currentDate = completedDays.has(today.toLocaleDateString("en-CA"))
      ? today
      : yesterday;

    let streak = 0;

    while (completedDays.has(currentDate.toLocaleDateString("en-CA"))) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    res.json({ success: true, currentStreak: streak });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to calculate streak"
    });
  }
});

// Add a habit
router.post("/", async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Habit title is required"
      });
    }

    const habit = await Habit.create({
      user: req.userId,
      title,
      description,
      category
    });

    res.status(201).json({
      success: true,
      message: "Habit created successfully",
      habit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create habit"
    });
  }
});

// Edit a habit
router.put("/:id", async (req, res) => {
  try {
    const { title, description, category } = req.body;

    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { title, description, category },
      { new: true, runValidators: true }
    );

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: "Habit not found"
      });
    }

    res.json({
      success: true,
      message: "Habit updated successfully",
      habit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update habit"
    });
  }
});

// Delete a habit
router.delete("/:id", async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: "Habit not found"
      });
    }

    res.json({
      success: true,
      message: "Habit deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete habit"
    });
  }
});

// Mark habit complete and award XP
router.patch("/:id/complete", async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: "Habit not found"
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alreadyCompleted = habit.completedDates.some((date) => {
      const completedDate = new Date(date);
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime() === today.getTime();
    });

    if (alreadyCompleted) {
      return res.status(400).json({
        success: false,
        message: "Habit already completed today"
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    habit.completedDates.push(today);
    await habit.save();

    // Award 10 XP
    user.xp = (user.xp || 0) + 10;

    // Every 100 XP increases the level
    const newLevel = Math.floor(user.xp / 100) + 1;
    const leveledUp = newLevel > (user.level || 1);
    user.level = newLevel;

    await user.save();

    res.json({
      success: true,
      message: "Habit completed successfully",
      habit,
      rewards: {
        xpEarned: 10,
        totalXP: user.xp,
        level: user.level,
        leveledUp
      }
    });
  } catch (error) {
    console.error("Habit completion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to complete habit"
    });
  }
});

module.exports = router;
