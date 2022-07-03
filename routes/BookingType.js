const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createBookingType,
  getBookingTypes,
  getBookingType,
  multDeleteBookingType,
  updateBookingType,
  getCounBookingType,
} = require("../controller/BookingType");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createBookingType)
  .get(getBookingTypes);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCounBookingType);

router
  .route("/delete")
  .delete(protect, authorize("admin"), multDeleteBookingType);
router
  .route("/:id")
  .get(getBookingType)
  .put(protect, authorize("admin", "operator"), updateBookingType);

module.exports = router;
