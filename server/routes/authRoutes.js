const express = require("express");
const supabase = require("../config/supabase");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, full_name, role, created_at")
      .eq("id", req.user.id)
      .single();

    if (error) {
      throw error;
    }

    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
      },
      profile,
    });
  } catch (error) {
    console.error("Profile error:", error);

    res.status(500).json({
      message: "Unable to load user profile",
    });
  }
});

module.exports = router;