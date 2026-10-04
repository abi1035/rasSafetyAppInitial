const supabase = require("../config/supabase");

function requireRole(requiredRole) {
  return async function (req, res, next) {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", req.user.id)
        .single();

      if (error || !profile) {
        return res.status(403).json({
          message: "User profile not found",
        });
      }

      if (profile.role !== requiredRole) {
        return res.status(403).json({
          message: "You do not have permission to perform this action",
        });
      }

      next();
    } catch (error) {
      console.error("Role check error:", error);

      res.status(500).json({
        message: "Unable to verify user role",
      });
    }
  };
}

module.exports = requireRole;