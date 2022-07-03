const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createEmployee,
  getEmployees,
  getEmployee,
  multDeleteEmployee,
  updateEmployee,
  getCounEmployee,
} = require("../controller/Employee");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createEmployee)
  .get(getEmployees);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCounEmployee);

router.route("/delete").delete(protect, authorize("admin"), multDeleteEmployee);
router
  .route("/:id")
  .get(getEmployee)
  .put(protect, authorize("admin", "operator"), updateEmployee);

module.exports = router;
