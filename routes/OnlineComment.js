const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createComment,
  getComments,
  getComment,
  multDeleteComment,
  updateComment,
  getCounComment,
} = require("../controller/OnlineComment");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createComment)
  .get(getComments);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCounComment);

router.route("/delete").delete(protect, authorize("admin"), multDeleteComment);
router
  .route("/:id")
  .get(getComment)
  .put(protect, authorize("admin", "operator"), updateComment);

module.exports = router;
