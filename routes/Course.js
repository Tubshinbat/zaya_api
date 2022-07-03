const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createCourse,
  getCourses,
  getCourse,
  multDeleteCourse,
  updateCourse,
  getCounCourse,
} = require("../controller/Course");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createCourse)
  .get(getCourses);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCounCourse);

router.route("/delete").delete(protect, authorize("admin"), multDeleteCourse);
router
  .route("/:id")
  .get(getCourse)
  .put(protect, authorize("admin", "operator"), updateCourse);

module.exports = router;
