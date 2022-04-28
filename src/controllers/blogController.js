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
    //check data is coming or not
    if (!req.query) {
      return res.status(404).send({ status: false, msg: "Invalid Parameters" });
    }

    let data = req.query;
    /// check the respective data is there or not
    if (
      !(data.authorId || data.category || data.tags || data.subcategory)
    ) {
      res.status(400).send({ status: false, msg: "Invalid parameters" });
    }

    if (data.title && !data.body) {
      delete data.title;
    }
    if (!data.title && data.body) {
      delete data.body;
    }
    if (data.title && data.body) {
      delete data.title;
      delete data.body;
    }

    let dataUpdated = req.query;

    // Validate the authorId
    if (!isValidObjectId(dataUpdated.authorId)) {
      return res
        .status(400)
        .send({ status: false, msg: "authorId is Invalid" });
    }

    let authorId1 = await authorModel.findById(dataUpdated.authorId);

    if (!authorId1) {
      return res.status(404).send({ status: false, msg: "Author Not Found" });
    }

    if (authorId1) {
      dataUpdated.isDeleted = false;
      dataUpdated.isPublished = true;
      const blogData = await blogModels.find(dataUpdated);

      if (blogData.length == 0) {
        return res
          .status(404)
          .send({ status: false, msg: "Blogdata Not Found" });
      }
      return res.status(200).send({
        status: true,
        msg: "Data Fetched Successfully",
        data: blogData,
      });
    }
    // let filtered = await blogModels.find(
    //   { isDeleted: false },
    //   { isPublished: true },
    //   {
    //     $or: [
    //       { authorId: authorId1 },
    //       { category: category1 },
    //       { tags: { $all: [tags1] } },
    //       { subcategory: { $all: [subcategory1] } },
    //     ],
    //   }
    // );

    // // Check whether the document is found or not
    // if (!filtered) {
    //   return res.status(404).send({ status: false, data: "Data Not Found" });
    // }

    // res.status(200).send({
    //   status: true,
    //   msg: "blogs are successfully fetched",
    //   data: filtered,
    // });
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
    let data = req.body;

    // validate the title
    if (!isValidString(data.title)) {
      return res
        .status(400)
        .send({ status: false, msg: "Title is required for Updation" });
    }

    // validate the body
    if (!isValidString(data.body)) {
      return res
        .status(400)
        .send({ status: false, msg: "Body is required for Updation" });
    }

    // validate the tags
    if (!data.tags.length === 0) {
      return res
        .status(400)
        .send({ status: false, msg: "Tags is required for Updation" });
    }

    // validate the subcategory
    if (!data.subcategory.length === 0) {
      return res
        .status(400)
        .send({ status: false, msg: "Subcategory is required for Updation" });
    }

    if (
      req.body.title ||
      req.body.body ||
      req.body.tags ||
      req.body.subcategory
    ) {
      const title = req.body.title;
      const body = req.body.body;
      const tags = req.body.tags;
      const subcategory = req.body.subcategory;
      const isPublished = req.body.isPublished;

      let updatedDoc = await blogModels.findOneAndUpdate(
        { _id: id },
        {
          title: title,
          body: body,
          $addToSet: { tags: tags, subcategory: subcategory }, // new method for updating/adding data in Array
          isPublished: isPublished,
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
    } else {
      return res
        .status(400)
        .send({ status: false, msg: "Please provide blog details to update" });
    }
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
    // check if blog exists or not
    let data = await blogModels.findOne({ _id: id });

    if (data.isDeleted == false) {
      let deleteBlog = await blogModels.findOneAndUpdate(
        { _id: id },
        { isDeleted: true, deletedAt: new Date() },
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
    } else {
      return res
        .status(404)
        .send({ status: false, msg: "Blog already deleted" });
    }
  } catch (err) {
    return res.status(500).send({ status: false, err: err.message });
  }
};

// Updating blogs by given requirement i.e Deletion
const deleteByQuery = async function (req, res) {
  try {
    let id = req.params.blogId;
    // check id exists or not
    if (!id) {
      return res
        .status(404)
        .send({ status: false, msg: "Blog Id Must be present" });
    }
    
    let data = req.query;

    //   category, authorid, tag name, subcategory name, unpublished
    if (!data.category || !data.authorId || !data.tags || !data.subcategory) {
      return res
        .status(400)
        .send({ status: false, msg: "Filter Queries Are Not Valid" });
    }

    let updatedDoc = await blogModels.findOneAndUpdate(
      data,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    // check deleted document exists or not
    if (!updatedDoc) {
      return res
        .status(404)
        .send({ status: false, msg: "Document Not Found in Blogs " });
    }
    res.status(200).send({
      status: true,
      msg: "Blog Deleted Successfully",
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



