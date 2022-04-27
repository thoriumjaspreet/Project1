const express = require("express");
const router = express.Router();
const authorController = require("../controllers/authorController.js");
const blogController = require("../controllers/blogController");

router.post("/createAuthor", authorController.createAuthor);

router.post("/createBlogs", blogController.createBlogs);

module.exports = router;
