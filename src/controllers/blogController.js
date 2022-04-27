const authorModel = require("../models/authorModel.js");
const blogModels = require("../models/blogModel.js");
const mongoose = require("mongoose");

const isValidObjectId = function (objectId) {
  return mongoose.Types.ObjectId.isValid(objectId);
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
    let authorId1 = req.query.authorId;
    let category1 = req.query.category;
    let tags1 = req.query.tag;
    let subcategory1 = req.query.subcategory;

    //------------------------------------------------------------------------------------------------------------
    // Validate the Category Attribute
    if (category1 == "" || typeof category1 != String) {
      return res
        .status(400)
        .send({ status: false, msg: "category is Invalid" });
    }

    // Validate the authorId
    if (!isValidObjectId(authorId1)) {
      return res
        .status(400)
        .send({ status: false, msg: "authorId is Invalid" });
    }

    // Validate the authorId

    let filtered = await blogModels.find(
      { isDeleted: false },
      { isPublished: true },
      {
        $or: [
          { authorId: authorId1 },
          { category: category1 },
          { tags: { $all: [tags1] } },
          { subcategory: { $all: [subcategory1] } },
        ],
      }
    );

    // Check whether the document is found or not
    if (!filtered) {
      return res.status(404).send({ status: false, data: "Data Not Found" });
    }

    res.status(200).send({
      status: true,
      msg: "blogs are successfully fetched",
      data: filtered,
    });
  } catch (err) {
    return res.status(500).send({ status: false, err: err.message });
  }
};

// Updating blogs by given requirement
const update = async function (req, res) {
  //title, body, adding tags, adding a subcategory.
  try {
    let id = req.params.blogId;
    // check id exists or not
    if (!id) {
      return res
        .status(404)
        .send({ status: false, msg: "BlogId Must be present" });
    }
    let title1 = req.query.title;
    let body1 = req.query.body;
    let tags1 = req.query.tags;
    let subcategory1 = req.query.subcategory;

    // let updatedtag = Blog.tags;
    // updatedtag.push(tags);

    // let updatedSubcategory = Blog.subcategory;
    // updatedSubcategory.push(subcategory);

    let updatedDoc = await blogModels.findOneAndUpdate(
      { _id: id },
      {
        title: title1,
        body: body1,
        $addToSet: { tags: tags1, subcategory: subcategory1 }, // new method for updating/adding data in Array
        isPublished: true,
      },
      { new: true }
    );

    // Update the isPublished to true
    if (updatedDoc.isPublished == true) {
      return (updatedDoc.publishedAt = new Date());
    }

    // Update the isPublished to false
    if (updatedDoc.isPublished == false) {
      return (updatedDoc.publishedAt = null);
    }

    // check if updated document found or not
    if (!updatedDoc) {
      return res
        .status(404)
        .send({ status: false, msg: "Document Not Found in Blogs " });
    }

    res.status(200).send({
      status: true,
      msg: "blogs are successfully Updated",
      data: updatedDoc,
    });
  } catch (err) {
    return res.status(500).send({ status: false, err: err.message });
  }
};

// Updating blogs by given requirement i.e Deleting
const deleteBlog = async function (req, res) {
  try {
    let id = req.params.blogId;
    // check id exists or not
    if (!id) {
      return res
        .status(404)
        .send({ status: false, msg: "Blog Id Must be present" });
    }
    let deleteBlog = await blogModels.findOneAndDelete(
      { _id: id },
      { isDeleted: true },
      { new: true }
    );
    // check deleted document exists or not
    if (!deleteBlog) {
      return res
        .status(404)
        .send({ status: false, msg: "Document Not Found in Blogs " });
    }

    res.send(200).send({
      status: true,
      msg: "Deleted Blog Successfully",
      data: deleteBlog,
    });
  } catch (err) {
    return res.status(500).send({ status: false, err: err.message });
  }
};

// Updating blogs by given requirement i.e Deletion
const deleteByQuery = async function (req, res) {
  try {
    let data = req.query;

    //   category, authorid, tag name, subcategory name, unpublished
    if (!data.category && !data.authorId && !data.tags && !data.subcategory) {
      return res
        .status(400)
        .send({ status: false, msg: "Filter Queries Are Not Valid" });
    }

    let updatedDoc = await blogModels.findOneAndUpdate(
      data,
      { isDeleted: true },
      { new: true }
    );

    // check deleted document exists or not
    if (!deleteBlog) {
      return res
        .status(404)
        .send({ status: false, msg: "Document Not Found in Blogs " });
    }
    res.status(200).send({
      status: true,
      msg: "Data Deleted Successfully",
      data: updatedDoc,
    });
  } catch (err) {
    return res.status(500).send({ status: false, err: err.message });
  }
};

module.exports.createBlogs = createBlogs;
module.exports.getBlogs = getBlogs;
module.exports.update = update;
module.exports.deleteBlog = deleteBlog;
module.exports.deleteByQuery = deleteByQuery;
