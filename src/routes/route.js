const express = require("express");
const router = express.Router();
const allController = require("../controllers/allController");

router.post("/createAuthor", allController);

module.exports = router;
