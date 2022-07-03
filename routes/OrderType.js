const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createOrderType,
  getOrderTypes,
  getOrderType,
  multDeleteOrderType,
  updateOrderType,
  getCounOrderType,
} = require("../controller/OrderType");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createOrderType)
  .get(getOrderTypes);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCounOrderType);

router
  .route("/delete")
  .delete(protect, authorize("admin"), multDeleteOrderType);
router
  .route("/:id")
  .get(getOrderType)
  .put(protect, authorize("admin", "operator"), updateOrderType);

module.exports = router;
