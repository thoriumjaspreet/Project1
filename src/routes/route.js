const express = require("express");
const router = express.Router();
const authorController = require("../controllers/authorController.js");
const blogController = require("../controllers/blogController.js");
const mw=require("../middleware/auth")
// create Author
router.post("/createAuthor", authorController.createAuthor);

//loginAuthor
router.post("/login", authorController.loginAuthor)

// Create Blog
router.post("/createBlogs",mw.Authentication, blogController.createBlogs);

// Get Blogs by query
router.get("/getBlogs", blogController.getBlogs);

// Update Blog by id
router.put("/getBlogs/:blogId",mw.Authentication,mw.AuthorizationById, blogController.update);

// Delete Blog by id
router.delete("/getBlogs/:blogId",mw.Authentication,mw.AuthorizationById, blogController.deleteBlog);

// Delete By Query Params
router.put("/getBlogs",mw.Authentication,mw.AuthorizationById, blogController.deleteByQuery);

module.exports = router;
