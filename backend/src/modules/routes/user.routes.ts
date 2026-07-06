import express from "express";
import { requireAuth } from "../../middlewares/auth.middleware.ts";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware.ts";

const router = express.Router();

/**
 * Protected route example
 */
router.get("/profile", requireAuth, (req, res) => {
  const userReq = req as AuthenticatedRequest;

  res.json({
    message: "Protected route accessed successfully",
    user: userReq.user,
  });
});

export default router;