const express = require("express");
const router = express.Router();
const {getTickets, createTicket} = require("../controllers/ticketContoller");

const {protect} = require("../middleware/authMiddleware");

router.route('/').get(protect, getTickets).post(protect, createTicket);

module.exports = router;