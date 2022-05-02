const authorModel = require("../models/authorModel.js");
const blogModel = require("../models/blogModel");
const mongoose = require("mongoose");

const isValidObjectId = function (objectId) {
  return mongoose.Types.ObjectId.isValid(objectId);
};

const check = function (x){
return x.every(i => typeof(i) === "string")
}

// Creating Blog Model
const createBlogs = async function (req, res) {
  try {

    //Extract Data From Request Body
    let data = req.body;

    // Validate the blog data is present or not
    if (Object.keys(data).length == 0) 
    { 
      return res.status(400).send({status: false,msg: "Invalid request !! Please Provide Blog Details" });
    }

    // Storing Decoded Token into variable named decodedToken
    let decodedToken =  req.decodedToken
    // Authorize the author that is requesting to find blogs
    // Validate the authorId with help of decoded Token AuthorId if it is present in req.query
    if(data.authorId != null && data.authorId != decodedToken.authorId )
    {
    return res.status(400).send({status: false , msg: "Author is Different"})
    }

    // Validate the title in blog
    let checkString = /[a-zA-Z]/
    if (!data.title || ! (checkString.test(data.tile))) 
    { 
    return res.status(400).send({status: false,msg: "Please Provide Blog Title"});
    }

    // Validate the body in blog
    if (!data.body || !checkString.test(data.body))
    {
    return res.status(400).send({status: false,msg: "Please Provide Blog Body"});
    }

    // Validate that authorId is coming or not in blog
    if (!data.authorId) 
    {
    return res.status(400).send({status: false,msg: "Please Provide Blog Author Id"});
    }

    // Validate the authorId
    if (!isValidObjectId(data.authorId)) 
    {
    return res.status(400).send({status: false, msg: "AuthorId is invalid"});
    }

    // Check Author Exists in database or not 
    let authorId = await authorModels.findById(data.authorId)
        
    if(!authorId) 
    {
    return res.status(400).send({status: false , msg:" Author is Not Present In Database"})   
    }

    // Validate the category in blog
    if (data.category.length == 0 || !(checkString.test(data.category))) 
    {
    return res.status(400).send({status: false, msg: "Please Provide Blog category"});
    }

  //save data in lowercase and remove the spaces
    data.category = data.category.toLowerCase().trim()

    //validate the tags in blog
    if( data.tags != undefined && check(data.tags) == false){
      return res.status(400).send({ status: false, msg: "Please Provide Valid Tags"})
    }


    // validate the Subcategory in blog
    if( data.subcategory != undefined &&  check(data.subcategory)== false){
      return res.status(400).send({ status: false, msg: "Please Provide Valid Subcategory"})
    }

    // For Array Data Like Tags and Subcategory
    for (let key in data) {
      if (Array.isArray(data[key])) {
          let arr=[];
          for (let i = 0; i < data[key].length; i++) {
                  if(data[key][i].trim().length>0)
              arr.push(data[key][i].toLowerCase().trim())
          }
          data[key] = [...arr];
      }
  }
  
    // Lets Add the Date isPublished if True 
    if (data.isPublished == true) 
    {
      data.publishedAt = new Date().toISOString();
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

    // check whether this of data
    if (!(queryData.authorId ||queryData.category ||queryData.tags ||queryData.subcategory)) 
    {
      return res.status(400).send({ status: false, msg: "Invalid Filters!!!. Please Provide Valid Filters" });
    }
    
    // Storing Decoded Token into variable named decodedToken
    let decodedToken =  req.decodedToken
    // Authorize the author that is requesting to find blogs
    // Validate the authorId with help of decoded Token AuthorId if it is present in req.query
    if(queryData.authorId != null && queryData.authorId != decodedToken.authorId )
    {
    return res.status(400).send({status: false , msg: "Author is Different"})
    }

    // exclude title and body
    if (req.query.title && !req.query.body) delete req.query.title;
    else if (req.query.body && !req.query.title) delete req.query.body;
    else if (req.query.title && req.query.body) {
      delete req.query.title;
      delete req.query.body;
    }

    queryData = req.query;
    
    // Check Author Id is coming or not if coming then Valid it 
    if (queryData.authorId && !isValidObjectId(queryData.authorId)) 
    {
      return res.status(400).send({ status: false, msg: "AuthorId is Invalid" });
    }

    if(queryData.category) queryData.category = queryData.category.toLowerCase().trim()  // Remove the space in category and save in lowercase
    if(queryData.tags) queryData.tags = queryData.tags.toLowerCase().trim()  // Remove the space in tags and save in lowercase
    if(queryData.subcategory) queryData.subcategory = queryData.subcategory.toLowerCase().trim()   //Remove the space in subcategory and save in lowercase
  
    // for array data like tags and subcategory
    for (let key in queryData) {
      if (Array.isArray(queryData[key])) {
          let arr=[];
          for (let i = 0; i < queryData[key].length; i++) {
                  if(queryData[key][i].trim().length>0)
              arr.push(queryData[key][i].toLowerCase().trim())
          }
          queryData[key] = [...arr];
      }
    }

    // Make Sure that Author Id must Not be Null
    // Second Method which we perform above with the help of decoded token author id  
    // if (queryData.authorId != null) {
    //   let authorId = await authorModels.findById(queryData.authorId);
    //   if (!authorId) 
    //   {
    //     return res.status(404).send({ status: false, msg: "Author not Found" });
    //   }
    // }


    // We have to find blogs which are deleted and blogs which are published
    queryData.isDeleted = false;
    queryData.isPublished = true;
    const blogData = await blogModel.find(queryData);
    // console.log(blogData);

    // Check that blogdata Find has some result or not
    if (blogData.length == 0) 
    {
      return res.status(404).send({ status: false, msg: "Document Not Found" });
    }

    return res.status(200).send({ status: true, data: blogData });

  } catch (err) {
    return res.status(500).send({ status: false, err: err.message });
  }
};

// Updating blogs By ID by given requirement
const update = async function (req, res) {
  try {

    let blog = req.body;
    //  check the blog data coming or not
    if (Object.keys(blog).length == 0) 
    {
      return res.status(400).send({status: false,msg: "Invalid request !! Please Provide Blog Details For Updating The Blog" });
    }

    let blogData = await blogModel.findById(blogId);
    if (!blogData || blogData.isDeleted == true) {
      return res.status(404).send({ status: false, msg: "Document Not Found" });
    }


     // for array data like tags and subcategory
     for (let key in blog) {
      if (Array.isArray(blog[key])) {
          let arr=[];
          for (let i = 0; i < blog[key].length; i++) {
                  if(blog[key][i].trim().length>0)
              arr.push(blog[key][i].toLowerCase().trim())
          }
          blog[key] = [...arr];
      }
    }
    
    // If Blog is published or not
    if (blogData.isPublished == false && blog.isPublished == true) 
    {
      blogData.isPublished = true;
      blogData.publishedAt = new Date().toISOString();
    }
    //Save the data 
    await blogData.save();

    let updatedBlog = await blogModel.findByIdAndUpdate(
      { _id: blogId },
      {
        $addToSet: { tags: blog.tags, subcategory: blog.subcategory },
        $set: { title: blog.title, body: blog.body },
      },
      { new: true }
    );

    res.status(200).send({status: true, msg: "Blog Updated Successfully", UpdatedData: updatedBlog });

  } catch (err) {
    return res.status(500).send({ status: false, err: err.message });
  }
};

// Delete Blogs By ID by given requirement
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
    blogData.deletedAt = new Date().toISOString();
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




