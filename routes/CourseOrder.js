const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createCourseOrder,
  getCourseOrders,
  getCourseOrder,
  multDeleteCourseOrder,
  updateCourseOrder,
  getCounCourseOrder,
} = require("../controller/CourseOrder");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createCourseOrder)
  .get(getCourseOrders);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCounCourseOrder);

router
  .route("/delete")
  .delete(protect, authorize("admin"), multDeleteCourseOrder);
router
  .route("/:id")
  .get(getCourseOrder)
  .put(protect, authorize("admin", "operator"), updateCourseOrder);

module.exports = router;
