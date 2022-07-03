const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createOrder,
  getOrders,
  getOrder,
  multDeleteOrder,
  updateOrder,
  getCountOrder,
} = require("../controller/Order");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createOrder)
  .get(getOrders);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCountOrder);

router.route("/delete").delete(protect, authorize("admin"), multDeleteOrder);
router
  .route("/:id")
  .get(getOrder)
  .put(protect, authorize("admin", "operator"), updateOrder);

module.exports = router;
