import { Router } from "express";

const router = Router();

// Retire the old demonstration lesson API, including all subpaths.
router.use((_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.status(410).json({
    message: "This lesson endpoint has been retired.",
  });
});

export default router;
