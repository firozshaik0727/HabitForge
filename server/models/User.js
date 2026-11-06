
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },

    // Gamification
    xp: {
      type: Number,
      default: 0,
      min: 0
    },
    level: {
      type: Number,
      default: 1,
      min: 1
    },

    // Profile
    bio: {
      type: String,
      default: "",
      maxlength: 160
    },
    profilePhoto: {
      type: String,
      default: ""
    },

    // Appearance preferences
    preferences: {
      theme: {
        type: String,
        enum: ["dark", "light", "system"],
        default: "dark"
      },
      accentColor: {
        type: String,
        default: "emerald"
      },
      compactMode: {
        type: Boolean,
        default: false
      }
    },

    // Notification preferences
    notifications: {
      habitReminders: {
        type: Boolean,
        default: true
      },
      achievementAlerts: {
        type: Boolean,
        default: true
      },
      dailySummary: {
        type: Boolean,
        default: false
      }
    },

    // Password reset
    resetPasswordToken: {
      type: String,
      default: undefined
    },
    resetPasswordExpires: {
      type: Date,
      default: undefined
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
