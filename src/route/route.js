const express = require("express");
const router = express.Router();
const allController = require("../controllers/allControllers.js")




router.get("/createAuthor",allController.createAuthor)