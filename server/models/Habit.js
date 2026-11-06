
const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    category: {
      type: String,
      default: "Personal"
    },

    completedDates: {
      type: [Date],
      default: []
    },

    // Habit schedule
    frequency: {
      type: String,
      enum: ["daily", "weekly", "custom"],
      default: "daily"
    },

    scheduledDays: {
      type: [Number],
      default: []
    },

    // Habit settings
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },

    dailyTarget: {
      type: Number,
      default: 1,
      min: 1
    },

    notes: {
      type: String,
      default: ""
    },

    reminder: {
      enabled: {
        type: Boolean,
        default: false
      },
      time: {
        type: String,
        default: ""
      }
    },

    isActive: {
      type: Boolean,
      default: true
    },

    isArchived: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Habit", habitSchema);
