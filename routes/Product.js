const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createProduct,
  getProducts,
  getProduct,
  multDeleteProduct,
  updateProduct,
  getCounProduct,
} = require("../controller/Product");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createProduct)
  .get(getProducts);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCounProduct);

router.route("/delete").delete(protect, authorize("admin"), multDeleteProduct);
router
  .route("/:id")
  .get(getProduct)
  .put(protect, authorize("admin", "operator"), updateProduct);

module.exports = router;
