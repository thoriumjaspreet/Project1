const express = require("express");
const router = express.Router();
const authorController = require("../controllers/authorController.js");
const blogController = require("../controllers/blogController.js");

// create Author
router.post("/createAuthor", authorController.createAuthor);

// Create Blog
router.post("/createBlogs", blogController.createBlogs);

// Get Blogs by query
router.get("/getBlogs", blogController.getBlogs);

// Update Blog by id
router.put("/getBlogs/:blogId", blogController.getBlogs);

// Delete Blog by id
router.delete("/getBlogs/:blogId", blogController.deleteBlog);

// Delete By Query Params
router.put("/getBlogs/:blogId", blogController.deleteByQuery);

module.exports = router;
