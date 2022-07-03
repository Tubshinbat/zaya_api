const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createOnlineCourse,
  getOnlineCourses,
  getOnlineCourse,
  multDeleteOnlineCourse,
  updateOnlineCourse,
  getCounOnlineCourse,
} = require("../controller/OnlineCourse");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createOnlineCourse)
  .get(getOnlineCourses);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCounOnlineCourse);

router
  .route("/delete")
  .delete(protect, authorize("admin"), multDeleteOnlineCourse);
router
  .route("/:id")
  .get(getOnlineCourse)
  .put(protect, authorize("admin", "operator"), updateOnlineCourse);

module.exports = router;
