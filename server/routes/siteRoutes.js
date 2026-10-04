const express = require("express");
const supabase = require("../config/supabase");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { data: sites, error } = await supabase
      .from("sites")
      .select("id, name")
      .eq("active", true)
      .order("name");

    if (error) {
      throw error;
    }

    res.json(sites);
  } catch (error) {
    console.error("Unable to load sites:", error);

    res.status(500).json({
      message: "Unable to load sites",
    });
  }
});

module.exports = router;