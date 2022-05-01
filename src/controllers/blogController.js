const authorModel = require("../models/authorModel.js");
const blogModel = require("../models/blogModel");
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

    let blogDetails = await blogModel.create(data);
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
    const blogData = await blogModel.find(queryData);
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

    let blogData = await blogModel.findById(blogId);
    if (!blogData || blogData.isDeleted == true) {
      return res.status(404).send({ status: false, msg: "Document Not Found" });
    }

    if (blogData.isPublished == false && blog.isPublished == true) {
      blogData.isPublished = true;
      blogData.publishedAt = new Date();
    }
    await blogData.save();

    let updatedBlog = await blogModel.findByIdAndUpdate(
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
    let blogId = req.params.blogId;
    if (!isValidObjectId(blogId)){
      return res.status(400).send({ status: false, msg: "Invalid Blog-Id" });
    }

    // find blog data
    let blogData = await blogModel.findById(blogId);
    if (!blogData || blogData.isDeleted == true) {
     return  res.status(404).send({ status: false, msg: "Data Not Found" });
    }

    blogData.isDeleted = true;
    blogData.deletedAt = new Date();
    await blogData.save();
    res.status(200).send({ status: true, msg: "Data deleted succesfully" });
  } catch (err) {
    return res.status(500).send({ status: false, err: err.message });
  }
};

// Updating blogs by given requirement i.e Deletion
const deleteByQuery = async function (req, res) {
  try {
    // Extract Data From Query Params
    let queryData = req.query;

     // Check queries are coming or not
     if (Object.keys(queryData).length == 0) 
     { 
      return res.status(400).send({ status: false, msg: "Invalid request !! Please Provide Blog Details"})
     }

    // Authorise the author that is requesting to find blogs
    let decodedToken = req.decodedToken
    if(queryData.authorId && decodedToken.authorId != queryData.authorId )
    {
     return res.status(403).send({status: false , msg: "Author is not allowed to perform this task"})
    } 
    
    // Store the Author Id from decoded Token to QueryData.AuthorId
    queryData.authorId = decodedToken.authorId;

    // Check if Valid delete queries Are Coming Or Not
    if (!(queryData.category || queryData.authorId || queryData.tags || queryData.subcategory)) 
    {
    return res.status(404).send({ status: false, msg: "Invalid Request...." });
    }
    
    // Check that author who is requesting to delete has valid id or not
    if (queryData.authorId && !(isValidObjectId(queryData.authorId)))
   {
    return res.status(400).send( {status: false, msg: 'AuthorId is Invalid'})
   }

   // Check the Author is Exists in Author Collection Or not
   if(queryData.authorId)
   {
    let authorId = await authorModel.findById(queryData.authorId)
    if(!authorId) 
    {
    return res.status(404).send({status: false , msg:"Author not Found"})   
    }
  }

  // Ensuring that that data is not deleted
    queryData.isDeleted = false;

  // Finally Updating Blog Details
  let data1 = await blogModel.updateMany(
      queryData,
      { isDeleted: true, deletedAt: new Date().toDateString() },
      { new: true }
    );

  if(!data1)
  {
  return res.status(404).send({status:false,msg:"No Match Has Been Found"})  
  }
  
  return res.status(200).send({ status: true, status: "Blog Deleted Successfully", msg: data1 });


  } catch (err) {
    return res.status(500).send({ status: false, err: err.message });
  }
};



module.exports.createBlogs = createBlogs;
module.exports.getBlogs = getBlogs;
module.exports.update = update;
module.exports.deleteBlog = deleteBlog;
module.exports.deleteByQuery =deleteByQuery;




