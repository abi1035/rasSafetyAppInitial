const express = require("express");

const supabase = require("../config/supabase");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/", authMiddleware, requireRole("framer"), async (req, res) => {
  try {
    const {
      siteId,
      submissionDate,
      hardHat,
      safetyVest,
      safetyBoots,
      eyeProtection,
      fallProtection,
      laddersScaffoldingInspected,
      toolsCordsGoodCondition,
      hazardsIdentified,
      notes,
    } = req.body;

    if (!siteId || !submissionDate) {
      return res.status(400).json({
        message: "Job site and date are required",
      });
    }

    const { data: submission, error } = await supabase
      .from("submissions")
      .insert({
        user_id: req.user.id,
        site_id: siteId,
        submission_date: submissionDate,

        hard_hat: hardHat,
        safety_vest: safetyVest,
        safety_boots: safetyBoots,
        eye_protection: eyeProtection,

        fall_protection: fallProtection,

        ladders_scaffolding_inspected: laddersScaffoldingInspected,

        tools_cords_good_condition: toolsCordsGoodCondition,

        hazards_identified: hazardsIdentified,

        notes: notes?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      message: "Safety form submitted successfully",
      submission,
    });
  } catch (error) {
    console.error("Create submission error:", error);

    res.status(500).json({
      message: "Unable to submit safety form",
    });
  }
});

router.get("/mine", authMiddleware, requireRole("framer"), async (req, res) => {
  try {
    const { data: submissions, error } = await supabase
      .from("submissions")
      .select(
        `
          id,
          submission_date,
          status,
          created_at,
          notes,
          hard_hat,
          safety_vest,
          safety_boots,
          eye_protection,
          fall_protection,
          ladders_scaffolding_inspected,
          tools_cords_good_condition,
          hazards_identified,
          sites (
            id,
            name
          )
        `,
      )
      .eq("user_id", req.user.id)
      .order("submission_date", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    res.json(submissions);
  } catch (error) {
    console.error("Unable to load submissions:", error);

    res.status(500).json({
      message: "Unable to load submissions",
    });
  }
});

router.post(
  "/:id/photos",
  authMiddleware,
  requireRole("framer"),
  upload.array("photos", 5),

  async (req, res) => {
    try {
      const { id } = req.params;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          message: "Please select at least one photo",
        });
      }

      // Make sure the submission belongs to
      // the currently logged-in Framer.
      const {
        data: submission,
        error: submissionError,
      } = await supabase
        .from("submissions")
        .select("id")
        .eq("id", id)
        .eq("user_id", req.user.id)
        .single();

      if (submissionError || !submission) {
        return res.status(404).json({
          message: "Submission not found",
        });
      }

      const uploadedPhotos = [];

      for (const file of req.files) {
        const safeFileName = file.originalname.replace(
          /[^a-zA-Z0-9._-]/g,
          "_",
        );

        const storagePath =
          `submissions/${id}/` +
          `${Date.now()}-${safeFileName}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from("safety-photos")
          .upload(storagePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: photoRecord,
          error: photoError,
        } = await supabase
          .from("submission_photos")
          .insert({
            submission_id: id,
            storage_path: storagePath,
            file_name: file.originalname,
          })
          .select()
          .single();

        if (photoError) {
          // Remove uploaded file if DB insert fails.
          await supabase.storage
            .from("safety-photos")
            .remove([storagePath]);

          throw photoError;
        }

        uploadedPhotos.push(photoRecord);
      }

      res.status(201).json({
        message: "Photos uploaded successfully",
        photos: uploadedPhotos,
      });
    } catch (error) {
      console.error("Photo upload error:", error);

      res.status(500).json({
        message: "Unable to upload photos",
      });
    }
  },
);

router.get(
  "/:id",
  authMiddleware,
  requireRole("framer"),
  async (req, res) => {
    try {
      const { id } = req.params;

      // First make sure this submission belongs
      // to the logged-in Framer.
      const { data: submission, error } = await supabase
        .from("submissions")
        .select(`
          id,
          submission_date,
          status,
          created_at,
          notes,
          hard_hat,
          safety_vest,
          safety_boots,
          eye_protection,
          fall_protection,
          ladders_scaffolding_inspected,
          tools_cords_good_condition,
          hazards_identified,
          sites (
            id,
            name
          )
        `)
        .eq("id", id)
        .eq("user_id", req.user.id)
        .single();

      if (error || !submission) {
        return res.status(404).json({
          message: "Submission not found",
        });
      }

      // Load all photo records for this submission.
      const {
        data: photoRecords,
        error: photoError,
      } = await supabase
        .from("submission_photos")
        .select(`
          id,
          storage_path,
          file_name,
          created_at
        `)
        .eq("submission_id", id)
        .order("created_at", {
          ascending: true,
        });

      if (photoError) {
        throw photoError;
      }

      // Generate temporary URLs because our
      // storage bucket is private.
      const photos = [];

      for (const photo of photoRecords) {
        const {
          data: signedUrlData,
          error: signedUrlError,
        } = await supabase.storage
          .from("safety-photos")
          .createSignedUrl(
            photo.storage_path,
            60 * 60,
          );

        if (signedUrlError) {
          console.error(
            "Unable to create photo URL:",
            signedUrlError,
          );

          continue;
        }

        photos.push({
          id: photo.id,
          file_name: photo.file_name,
          url: signedUrlData.signedUrl,
        });
      }

      res.json({
        ...submission,
        photos,
      });
    } catch (error) {
      console.error(
        "Unable to load submission:",
        error,
      );

      res.status(500).json({
        message: "Unable to load submission",
      });
    }
  },
);

module.exports = router;
