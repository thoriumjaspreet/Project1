const express = require("express");
const router = express.Router();
const { createAuthor, loginAuthor } = require("../controllers/authorController.js");
const {createBlogs, getBlogs, updateBlogs, deleteBlog, deleteByQuery } = require("../controllers/blogController.js");
const { login, AuthorizationById } = require("../middleware/middleware.js")


//--------------------------------------------------------------------------------------------------------------------------------
// AUTHOR ROUTES
// Create A New Author.
router.post("/createAuthor", createAuthor);

// Login to Author.
router.post("/login", loginAuthor);

//--------------------------------------------------------------------------------------------------------------------------------
// BLOG ROUTES (PROTECTED API'S)

// Create a New Blog.
router.post("/createBlogs", login, createBlogs);

// Get Blogs by Query.
router.get("/getBlogs",login, getBlogs);

// Update Blog by BlogId.
router.put("/UpdateBlogs/:blogId", login, AuthorizationById, updateBlogs);

// Delete Blog by BlogId.
router.delete("/deleteBlogsById/:blogId", login, AuthorizationById , deleteBlog);

// Delete By Query Params.
router.delete("/deleteBlogsByQuery", login, deleteByQuery);

module.exports = router;
