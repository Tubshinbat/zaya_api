const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createBooking,
  getBookings,
  getBooking,
  multDeleteBooking,
  updateBooking,
  getCounBooking,
  bookingTime,
} = require("../controller/Booking");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createBooking)
  .get(getBookings);

router.route("/time").get(bookingTime);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCounBooking);

router.route("/delete").delete(protect, authorize("admin"), multDeleteBooking);
router
  .route("/:id")
  .get(getBooking)
  .put(protect, authorize("admin", "operator"), updateBooking);

module.exports = router;
