
const express = require("express");
const router = express.Router();

const User = require("../models/User");
const auth = require("../middleware/auth");

// GET logged-in user's profile
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -resetPasswordToken -resetPasswordExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Profile error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not load profile",
    });
  }
});

module.exports = router;
