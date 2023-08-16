const express = require("express");
const router = express.Router();

const Tasks = require("../controllers/tasks");

const auth = require("../middleware/index");

router.post("/", auth.authToken, auth.isPrincipal, Tasks.createTask);
router.get("/view/:taskId", auth.authToken, Tasks.getTask);
router.get("/pending", auth.authToken, auth.isAdmin, Tasks.getPendingRequests);
router.get("/ongoing", auth.authToken, Tasks.getOngoingTasks);
router.get("/history", auth.authToken, Tasks.getTaskHistory);
router.put(
  "/view/:taskId/principal/last-viewed",
  auth.authToken,
  auth.isPrincipal,
  auth.isOwnerPrincipal,
  Tasks.updateLastViewed
);
router.put(
  "/view/:taskId/admin/approve/:type",
  auth.authToken,
  auth.isAdmin,
  Tasks.approveRejectRequest
);
router.get("/taskpool", auth.authToken, auth.isProxze, Tasks.getTaskpool);
router.put(
  "/view/:taskId/proxze/make-offer",
  auth.authToken,
  auth.isProxze,
  // auth.isPaid,
  auth.isTaskUnassigned,
  Tasks.makeOffer
);
router.put(
  "/view/:taskId/principal/accept-offer",
  auth.authToken,
  auth.isPrincipal,
  auth.isOwnerPrincipal,
  auth.isPaid,
  auth.isTaskUnassigned,
  Tasks.acceptOffer
);
router.put(
  "/view/:taskId/admin/start-task",
  auth.authToken,
  auth.isAdmin,
  auth.isPaid,
  Tasks.startTask
);
router.put("/view/:taskId/proxze/upload", auth.isPaid, Tasks.uploadAttachment);
router.put(
  "/view/:taskId/proxze/complete-task",
  auth.authToken,
  auth.isProxze,
  auth.isOwnerProxze,
  auth.isPaid,
  Tasks.completeTask
);
router.put(
  "/view/:taskId/principal/confirm-task",
  auth.authToken,
  auth.isPrincipal,
  auth.isOwnerPrincipal,
  auth.isPaid,
  Tasks.confirmTask
);
router.put(
  "/view/:taskId/stream",
  // auth.authToken,
  // auth.isProxze,
  // auth.isOwnerProxze,
  Tasks.handleLive
);

module.exports = router;
