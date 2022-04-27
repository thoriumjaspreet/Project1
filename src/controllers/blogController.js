const blogModels = require("../models/blogModel.js");

const createBlogs = async function (req, res) {
  let data = req.body;

  // Validate the blog data is present or not
  if (!data.title) {
    return res.status(400).send({
      status: false,
      msg: "Invalid request !! Please Provide Blog Details",
    });
  }

  // Validate the title in blog
  if (!data.title) {
    return res.status(400).send({
      status: false,
      msg: "Please Provide Blog Title",
    });
  }

  // Validate the title in blog
  if (!data.body) {
    return res.status(400).send({
      status: false,
      msg: "Please Provide Blog Body",
    });
  }

  // Validate the title in blog
  if (!data.authorId) {
    return res.status(400).send({
      status: false,
      msg: "Please Provide Blog Author Id",
    });
  }

  // Validate the title in blog
  if (!data.tags) {
    return res.status(400).send({
      status: false,
      msg: "Please Provide Blog Title",
    });
  }


// Validate the blog title
  if (!data.tags) {
    return res.status(400).send({
      status: false,
      msg: "Please Provide Blog Tags",
    });
  }
  


// Validate the blog title
  if (!data.category) {
    return res.status(400).send({
      status: false,
      msg: "Please Provide Blog Tags",
    });
  }



// Validate the blog title
  if (!data.subcategory) {
    return res.status(400).send({
      status: false,
      msg: "Please Provide Blog Tags",
    });
  }


// authorId category, subcategory, isPublished
  let blogDetails = await blogModels.create(data);
  res.send({ status: true, data: blogDetails });
};
module.exports.createBlogs = createBlogs;
