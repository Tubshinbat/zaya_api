const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createContentCategory,
  getContentCategories,
  getContentCategory,
  multDeleteContentCategory,
  updateContentCategory,
  getCounContentCategory,
} = require("../controller/ContentCategory");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createContentCategory)
  .get(getContentCategories);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCounContentCategory);

router
  .route("/delete")
  .delete(protect, authorize("admin"), multDeleteContentCategory);
router
  .route("/:id")
  .get(getContentCategory)
  .put(protect, authorize("admin", "operator"), updateContentCategory);

module.exports = router;
