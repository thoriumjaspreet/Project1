const authorModels = require("../models/authorModel.js");
const blogModels = require("../models/blogModel.js");
// const validator = require('../Utils/validator.js')
const { isValidBody,
  isValid,
  isValid2,
  isValidObjectId,
  check } = require('../utils/validator')



//------------Creating Blog Model
const createBlogs = async (req, res) => {
  try {

    //Extract Data From Request Body
    let data = req.body;
    let { title, body, authorId, tags, category, subcategory, isPublished, publishedAt } = data

    // Validate the blog data is present or not
    if (!isValidBody(data)) {
      return res.status(400).send({ status: false, msg: "Invalid request !! Please Provide Blog Details" });
    }

    // Validate that authorId is coming or not in blog
    if (!isValid(authorId)) {
      return res.status(400).send({ status: false, msg: "Please Provide Blog Author Id" })
    }

    // Validate the authorId
    if (!isValidObjectId(authorId)) {
      return res.status(400).send({ status: false, msg: "AuthorId is invalid" });
    }

    // Storing Decoded Token into variable named decodedToken
    let decodedToken = req.decodedToken

    // Authorize the author that is requesting to find blogs
    if (authorId != decodedToken.authorId) {
      return res.status(400).send({ status: false, msg: "Author is Different" })
    }

    // Validate the title in blog
    if (!isValid(title) || !isValid2(title)) {
      return res.status(400).send({ status: false, msg: "Please Provide Blog Title" });
    }

    // Validate the body in blog
    if (!isValid(body) || !isValid2(body)) {
      return res.status(400).send({ status: false, msg: "Please Provide Blog Body" });
    }

    // Validate the category in blog
    if (!isValid(category) || !isValid2(category)) {
      return res.status(400).send({ status: false, msg: "Please Provide Blog category" });
    }

    // Validate the Tags in Blog
    if (tags && !isValid(tags) && !check(tags)) {
      return res.status(400).send({ status: false, msg: "Please Provide Valid Tags" })
    }

    // Validate the Subcategory in Blogs
    if (subcategory && !isValid(subcategory) && !check(subcategory)) {
      return res.status(400).send({ status: false, msg: "Please Provide Valid Subcategory" })
    }


    // Check Author Exists in database or not 
    let authorIde = await authorModels.findById(authorId)

    if (!authorIde) {
      return res.status(400).send({ status: false, msg: " Author is Not Present In Database" })
    }

    // Lets Add the Date isPublished if True 
    if (isPublished == true) {
      publishedAt = new Date().toISOString();
    }

    // creating blog document for the valid author 
    let blogDetails = await blogModels.create(data);
    return res.status(201).send({ status: true, msg: "Blog Created Successfully", data: blogDetails });
  }
  catch (err) {
    return res.status(500).send({ status: false, err: err.message });
  }
};

//------------Getting Blogs by filter queries
const getBlogs = async (req, res) => {
  try {

    let queryData = req.query;
    const { authorId, category, tags, subcategory } = queryData

    // Storing Decoded Token into variable named decodedToken
    let decodedToken = req.decodedToken

    if (authorId in req.query) {

      // Authorize the author that is requesting to find blogs
      // Validate the authorId with help of decoded Token AuthorId if it is present in req.query
      if (authorId != decodedToken.authorId) {
        return res.status(400).send({ status: false, msg: "Author is Different" })
      }

      // Check Author Id is coming or not if coming then Valid it 
      if (!validator.isValidObjectId(authorId)) {
        return res.status(400).send({ status: false, msg: "AuthorId is Invalid" });
      }
    }

    // We have to find blogs which are deleted and blogs which are published
    queryData.isDeleted = false;
    queryData.isPublished = true;
    const blogData = await blogModels.find(queryData);

    // Check that blogData Find has some result or not
    if (blogData.length == 0) {
      return res.status(404).send({ status: false, msg: "Document Not Found" });
    }

    return res.status(200).send({ status: true, blogCount: blogData.length, msg: "Blog Data Successfully Fetched", data: blogData });

  } catch (err) {
    return res.status(500).send({ status: false, err: err.message });
  }
};

//------------Updating blogs By ID by given requirement
const updateBlogs = async (req, res) => {

  try {

    let blog = req.body;
    const { title, body, tags, subcategory, isPublished } = blog

    //  check the blog data coming or not
    if (!isValidBody(blog)) {
      return res.status(400).send({ status: false, msg: "Invalid request !! Please Provide Blog Details For Updating The Blog" });
    }

    // check query data
    if (!(title || body || tags || subcategory || isPublished)) {
      return res.status(400).send({ status: false, msg: "Invalid Filters!!!. Please Provide Valid Filters" });
    }

    //extract id from Path Params
    let blogId = req.params.blogId;
    let blogData = await blogModels.findById(blogId);

    if (!blogData || blogData.isDeleted == true) {
      return res.status(404).send({ status: false, msg: "Document Not Found" });
    }

    // If Blog is published or not
    if (blogData.isPublished == false && blog.isPublished == true) {
      blogData.isPublished = true;
      blogData.publishedAt = new Date().toISOString();
    }
    //Save the data 
    await blogData.save();

    // After Above All Conditions We Update Data
    let updatedBlog = await blogModels.findByIdAndUpdate(
      { _id: blogId },
      {
        $addToSet: { tags: blog.tags, subcategory: blog.subcategory },
        $set: { title: blog.title, body: blog.body },
      },
      { new: true });

    // sending the data as a response to the user
    res.status(200).send({ status: true, msg: "Blog Updated Successfully", UpdatedData: updatedBlog });

  } catch (err) {
    return res.status(500).send({ status: false, err: err.message });
  }
};

//------------Delete Blogs By ID by given requirement
const deleteBlog = async (req, res) => {
  try {

    // Extract Blog id From Path params
    let blogId = req.params.blogId;

    // find blog data
    let blogData = await blogModels.findById(blogId);

    if (!blogData || blogData.isDeleted == true) {
      res.status(404).send({ status: false, msg: "Data Not Found" });
    }

    blogData.isDeleted = true;
    blogData.deletedAt = new Date().toISOString();
    await blogData.save();
    return res.status(200).send({ message: "successfully Deleted" });

  } catch (err) {
    return res.status(500).send({ status: false, err: err.message });
  }
};

//------------Updating blogs by given requirement i.e Deletion
const deleteByQuery = async (req, res) => {

  try {
    // Extract Data From Query Params
    let queryData = req.query;
    const { category, authorId, tags, subcategory, isDeleted } = queryData

    // Check queries are coming or not
    if (Object.keys(queryData).length == 0) {
      return res.status(400).send({ status: false, msg: "Invalid request !! Please Provide Blog Details" })
    }

    // Authorize the author that is requesting to find blogs
    let decodedToken = req.decodedToken
    if (authorId && decodedToken.authorId != authorId) {
      return res.status(403).send({ status: false, msg: "Author is not allowed to perform this task" })
    }

    // Store the Author Id from decoded Token to QueryData.AuthorId
    queryData.authorId = decodedToken.authorId;

    // Check if Valid delete queries Are Coming Or Not
    if (!(category || authorId || tags || subcategory)) {
      return res.status(404).send({ status: false, msg: "Invalid Request...." });
    }

    // Check that author who is requesting to delete has valid id or not
    if (authorId && !(isValidObjectId(authorId))) {
      return res.status(400).send({ status: false, msg: 'AuthorId is Invalid' })
    }

    // Check the Author is Exists in Author Collection Or not
    if (authorId) {
      let authorId = await authorModels.findById(queryData.authorId)
      if (!authorId) { return res.status(404).send({ status: false, msg: "Author not Found" }) }
    }

    // Ensuring that that data is not deleted
    if (isDeleted == true) {
      return res.status(400).send({ status: false, msg: "Blog already deleted" })

    }

    // Finally Updating Blog Details
    let data = await blogModels.updateMany(
      queryData,
      { isDeleted: true, deletedAt: new Date().toISOString() },
      { new: true }
    );

    if (!data) {
      return res.status(404).send({ status: false, msg: "No Match has Been Found" })
    }

    return res.status(200).send({ status: true, status: "Blog Deleted Successfully", msg: data });
  } catch (err) {
    return res.status(500).send({ status: false, err: err.message });
  }
};


module.exports = { createBlogs, getBlogs, updateBlogs, deleteBlog, deleteByQuery }
