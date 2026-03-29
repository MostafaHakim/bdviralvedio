const express = require("express");
const router = express.Router();
const videoController = require("../controllers/videoController");
const auth = require("../middleware/auth");
const { upload } = require("../config/cloudinary");

router.get("/", videoController.getVideos);
router.get("/:id", videoController.getVideoById);
router.post("/", auth, videoController.createVideo);
router.delete("/:id", auth, videoController.deleteVideo);
router.post("/:id/like", auth, videoController.likeVideo);
router.post("/:id/comment", auth, videoController.addComment);

// File upload specific route
router.post(
  "/upload",
  auth,
  upload.fields([{ name: "video" }, { name: "thumbnail" }]),
  (req, res) => {
    try {
      const videoUrl = req.files["video"] ? req.files["video"][0].path : null;
      const thumbnailUrl = req.files["thumbnail"]
        ? req.files["thumbnail"][0].path
        : null;
      res.json({ videoUrl, thumbnailUrl });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

module.exports = router;
