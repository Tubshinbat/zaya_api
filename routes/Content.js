const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createContent,
  getContents,
  getContent,
  multDeleteContent,
  updateContent,
  getCounContent,
} = require("../controller/Content");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createContent)
  .get(getContents);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCounContent);

router.route("/delete").delete(protect, authorize("admin"), multDeleteContent);
router
  .route("/:id")
  .get(getContent)
  .put(protect, authorize("admin", "operator"), updateContent);

module.exports = router;
