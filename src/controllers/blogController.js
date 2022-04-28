const authorModel = require("../models/authorModel.js");
const blogModels = require("../models/blogModel.js");
const mongoose = require("mongoose");

const isValidObjectId = function (objectId) {
  return mongoose.Types.ObjectId.isValid(objectId);
};

const isValidString = function (value) {
  return value != null && typeof value === "string" && value.length > 0;
};

// Creating Blog Model
const createBlogs = async function (req, res) {
  try {
    let data = req.body;

    // Validate the blog data is present or not
    if (Object.keys(data).length == 0) {
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

    // Validate the body in blog
    if (!data.body) {
      return res.status(400).send({
        status: false,
        msg: "Please Provide Blog Body",
      });
    }

    // Validate that authorid is coming or not in blog
    if (!data.authorId) {
      return res.status(400).send({
        status: false,
        msg: "Please Provide Blog Author Id",
      });
    }

    // Validate the authorId
    if (!isValidObjectId(data.authorId)) {
      return res.status(400).send({
        status: false,
        msg: " AuthorId is invalid",
      });
    }

    // Validate the category in blog
    if (!data.category) {
      return res.status(400).send({
        status: false,
        msg: "Please Provide Blog category",
      });
    }

    if (data.isPublished == true) {
      data.publishedAt = new Date();
    }

    let blogDetails = await blogModels.create(data);
    res.status(201).send({
      status: true,
      msg: "Blog is Successfully Created",
      data: blogDetails,
    });
  } catch (err) {
    return res.status(500).send({ status: false, err: err.message });
  }
};

// Getting Blogs by filter queries
const getBlogs = async function (req, res) {
  try {
    let queryData = req.query;
    // check whwter this of data
    if (
      !(
        queryData.authorId ||
        queryData.category ||
        queryData.tags ||
        queryData.subcategory
      )
    ) {
      return res.status(400).send({ status: false, msg: "Invalid Filters" });
    }
    // exclude title and body
    if (req.query.title && !req.query.body) delete req.query.title;
    else if (req.query.body && !req.query.title) delete req.query.body;
    else if (req.query.title && req.query.body) {
      delete req.query.title;
      delete req.query.body;
    }

    queryData = req.query;

    if (queryData.authorId && !isValidObjectId(queryData.authorId)) {
      return res
        .status(400)
        .send({ status: false, msg: "AuthorId is Invalid" });
    }

    if (queryData.authorId) {
      let authorId = await authorModel.findById(queryData.authorId);
      if (!authorId) {
        return res.status(404).send({ status: false, msg: "Author not Found" });
      }
    }

    queryData.isDeleted = false;
    queryData.isPublished = true;
    const blogData = await blogModels.find(queryData);
    // console.log(blogData);
    if (blogData.length == 0) {
      return res.status(404).send({ status: false, msg: "Document Not Found" });
    }
    return res.status(200).send({ status: true, Data: blogData });
  } catch (err) {
    return res.status(500).send({ status: false, err: err.message });
  }
};

// Updating blogs by given requirement
const update = async function (req, res) {
  try {
    let blog = req.body;
    //  check the blog data coming or not
    if (Object.keys(blog).length == 0) {
      return res.status(400).send({status: false,msg: "Invalid request !! Please Provide Blog Details" });
    }
    
    // check query data
        if (! (blog.title || blog.body || blog.tags || blog.subcategory || blog.isPublished)) {
      return res.status(400).send({ status: false, msg: "Invalid Filters" });
    }
 
     //extract id
    let blogId = req.params.blogId;
    //check valid id or not
    if (!isValidObjectId(blogId)) {
      return res.status(400).send({ status: false, msg: "Invalid Blog-Id" });
    }

    let blogData = await blogModels.findById(blogId);
    if (!blogData || blogData.isDeleted == true) {
      return res.status(404).send({ status: false, msg: "Document Not Found" });
    }

    if (blogData.isPublished == false && blog.isPublished == true) {
      blogData.isPublished = true;
      blogData.publishedAt = new Date();
    }
    await blogData.save();

    let updatedBlog = await blogModels.findByIdAndUpdate(
      { _id: blogId },
      {
        $addToSet: { tags: blog.tags, subcategory: blog.subcategory },
        $set: { title: blog.title, body: blog.body },
      },
      { new: true }
    );

    res.status(200).send({
      status: true,
      msg: "Blog Updated Successfully",
      updatedData: updatedBlog,
    });
  } catch (err) {
    return res.status(500).send({ status: false, err: err.message });
  }
};

// Updating blogs by given requirement i.e Deleting
const deleteBlog = async function (req, res) {
  try {

    //check valid blog id
    let blogId = data.params.blogId;
    if (!isValidObjectId(blogId)){
      return res.status(400).send({ status: false, msg: "Invalid Blog-Id" });
    }

    // find blog data
    let blogData = await blogModels.findById(blogId);
    if (!blogData || blogData.isDeleted == true) {
      res.status(404).send({ status: false, msg: "Data Not Found" });
    }

    blogData.isDeleted = true;
    blogData.deletedAt = new Date();
    await blogData.save();
    res.status(200).send();
  } catch (err) {
    return res.status(500).send({ status: false, err: err.message });
  }
};

// Updating blogs by given requirement i.e Deletion
const deleteByQuery = async function (req, res) {
  try {
    let queryData = req.query;

    if (
      !(
        queryData.category ||
        queryData.authorId ||
        queryData.tags ||
        queryData.subcategory
      )
    ) {
      return res
        .status(404)
        .send({ status: false, msg: "Invalid Request...." });
    }

    let deletedDate = new Date();
    queryData.isDeleted = false;
    let data1 = await blogModels.updateMany(
      queryData,
      { isDeleted: true, deletedAt: deletedDate },
      { new: true }
    );

    return res
      .status(200)
      .send({ status: true, status: "Blog Deleted Successfully", msg: data1 });
  } catch (err) {
    return res.status(500).send({ status: false, err: err.message });
  }
};

module.exports.createBlogs = createBlogs;
module.exports.getBlogs = getBlogs;
module.exports.update = update;
module.exports.deleteBlog = deleteBlog;
module.exports.deleteByQuery = deleteByQuery;
