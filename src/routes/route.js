const express = require("express");
const router = express.Router();
const authorController = require("../controllers/authorController.js");
const blogController = require("../controllers/blogController.js");
const mw = require("../middleware/middleware.js")


//------------------------------------------------------------------------------------------
// AUTHOR ROUTES
// create Author
router.post("/createAuthor", authorController.createAuthor);

// Login Author
router.post("/login", authorController.loginAuthor);


//--------------------------------------------------------------------------------------------
// BLOG ROUTES (PROTECTED API'S)

// Create Blog
router.post("/createBlogs", mw.login,blogController.createBlogs);

// Get Blogs by query
router.get("/getBlogs",  mw.login,blogController.getBlogs);

// Update Blog by id
router.put("/UpdateBlogs/:blogId",mw.login,mw.AuthorizationById, blogController.update);

// Delete Blog by id
router.delete("/deleteBlogsById/:blogId",mw.login,mw.AuthorizationById ,blogController.deleteBlog);

// Delete By Query Params
router.delete("/deleteBlogsByQuery", mw.login,blogController.deleteByQuery);

module.exports = router;
