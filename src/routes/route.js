const express = require("express");
const router = express.Router();
const authorController = require("../controllers/authorController.js");
const blogController = require("../controllers/blogController.js");
const mw = require("../middleware/middleware.js")


//--------------------------------------------------------------------------------------------------------------------------------
// AUTHOR ROUTES
// Create A New Author.
router.post("/createAuthor", authorController.createAuthor);

// Login to Author.
router.post("/login", authorController.loginAuthor);


//--------------------------------------------------------------------------------------------------------------------------------
// BLOG ROUTES (PROTECTED API'S)

// Create a New Blog.
router.post("/createBlogs", mw.login,blogController.createBlogs);

// Get Blogs by Query.
router.get("/getBlogs",  mw.login,blogController.getBlogs);

// Update Blog by BlogId.
router.put("/UpdateBlogs/:blogId",mw.login,mw.AuthorizationById, blogController.update);

// Delete Blog by BlogId.
router.delete("/deleteBlogsById/:blogId",mw.login,mw.AuthorizationById ,blogController.deleteBlog);

// Delete By Query Params.
router.delete("/deleteBlogsByQuery", mw.login,blogController.deleteByQuery);

module.exports = router;
