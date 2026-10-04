const express = require("express");
const cors = require("cors");
require("dotenv").config();
const siteRoutes = require("./routes/siteRoutes");

const supabase = require("./config/supabase");
const authRoutes = require("./routes/authRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/submissions", submissionRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/sites", siteRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "RAS Safety API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.get("/api/test-supabase", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("sites")
      .select("*");

    if (error) {
      throw error;
    }

    res.json({
      message: "Supabase connected successfully",
      sites: data,
    });
  } catch (error) {
    console.error("Supabase connection error:", error);

    res.status(500).json({
      message: "Unable to connect to Supabase",
    });
  }
});

app.use((error, req, res, next) => {
  if (error) {
    console.error("Request error:", error);

    return res.status(400).json({
      message: error.message || "Invalid request",
    });
  }

  next();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});