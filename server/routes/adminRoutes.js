const express = require("express");

const supabase = require("../config/supabase");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/dashboard",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const {
        siteId,
        workerId,
        fromDate,
        toDate,
      } = req.query;

      let query = supabase
        .from("submissions")
        .select(`
          id,
          submission_date,
          status,
          created_at,
          notes,

          profiles (
            id,
            full_name
          ),

          sites (
            id,
            name
          )
        `)
        .order("created_at", {
          ascending: false,
        });

      if (siteId) {
        query = query.eq("site_id", siteId);
      }

      if (workerId) {
        query = query.eq("user_id", workerId);
      }

      if (fromDate) {
        query = query.gte(
          "submission_date",
          fromDate,
        );
      }

      if (toDate) {
        query = query.lte(
          "submission_date",
          toDate,
        );
      }

      const {
        data: submissions,
        error,
      } = await query;

      if (error) {
        throw error;
      }

      // Load available Framers for the filter.
      const {
        data: workers,
        error: workersError,
      } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "framer")
        .order("full_name");

      if (workersError) {
        throw workersError;
      }

      // Load active sites for the filter.
      const {
        data: sites,
        error: sitesError,
      } = await supabase
        .from("sites")
        .select("id, name")
        .eq("active", true)
        .order("name");

      if (sitesError) {
        throw sitesError;
      }

      const today = new Date()
        .toISOString()
        .split("T")[0];

      const todaySubmissions = submissions.filter(
        (submission) =>
          submission.submission_date === today,
      );

      const siteIds = new Set(
        submissions
          .map(
            (submission) =>
              submission.sites?.id,
          )
          .filter(Boolean),
      );

      const workerIds = new Set(
        submissions
          .map(
            (submission) =>
              submission.profiles?.id,
          )
          .filter(Boolean),
      );

      res.json({
        summary: {
          totalSubmissions:
            submissions.length,

          todaySubmissions:
            todaySubmissions.length,

          totalSites: siteIds.size,
          totalWorkers: workerIds.size,
        },

        submissions,

        filters: {
          workers,
          sites,
        },
      });
    } catch (error) {
      console.error(
        "Admin dashboard error:",
        error,
      );

      res.status(500).json({
        message:
          "Unable to load admin dashboard",
      });
    }
  },
);

module.exports = router;