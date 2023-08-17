const express = require("express");
const router = express.Router();

const Transactions = require("../controllers/transactions");

const auth = require("../middleware/index");
const Task = require("../models/task");
const { createTaskObject } = require("../utils/tasks");

// router.put(
//   "/task/:taskId/pay",
//   auth.authToken,
//   auth.isPrincipal,
//   auth.isOwnerPrincipal,
//   async (req, res) => {
//     try {
//       await Task.findByIdAndUpdate(
//         req.params.taskId,
//         { paymentStatus: true },
//         { new: true }
//       )
//         .populate("principal")
//         .populate("offers.proxzi");

//       return res.status(201).json({
//         status: true,
//         message: `Payment has been made successfully`,
//       });
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({
//         status: false,
//         message: "Server error",
//       });
//     }
//   }
// );

router.get("/", auth.authToken, Transactions.getTransactions);
router.put(
  "/deposit/task/:taskId",
  auth.authToken,
  auth.isPrincipal,
  auth.isOwnerPrincipal,
  Transactions.deposit
);
router.put(
  "/transfer/task/:taskId",
  auth.authToken,
  auth.isPrincipal,
  auth.isOwnerPrincipal,
  Transactions.transfer
);

module.exports = router;
