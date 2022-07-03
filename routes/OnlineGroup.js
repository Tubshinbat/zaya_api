const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createOnlineGroup,
  getOnlineGroups,
  getOnlineGroup,
  multDeleteOnlineGroup,
  updateOnlineGroup,
  getCounOnlineGroup,
} = require("../controller/OnlineGroup");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createOnlineGroup)
  .get(getOnlineGroups);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCounOnlineGroup);

router
  .route("/delete")
  .delete(protect, authorize("admin"), multDeleteOnlineGroup);
router
  .route("/:id")
  .get(getOnlineGroup)
  .put(protect, authorize("admin", "operator"), updateOnlineGroup);

module.exports = router;
