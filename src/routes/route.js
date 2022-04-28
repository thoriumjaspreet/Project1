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
router.put("/UpdateBlogs/:blogId", blogController.update);

// Delete Blog by id
router.delete("/deleteBlogsById/:blogId", blogController.deleteBlog);

// Delete By Query Params
router.delete("/deleteBlogsByQuery", blogController.deleteByQuery);

module.exports = router;
