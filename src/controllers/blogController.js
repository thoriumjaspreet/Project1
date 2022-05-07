const authorModels = require("../models/authorModel.js");
const blogModels = require("../models/blogModel.js");
const mongoose = require("mongoose");

const isValidObjectId = function (objectId) {
  return mongoose.Types.ObjectId.isValid(objectId);
};

//------------Function to check every element of Array TAGS to be string
const check = (x)=>{
return x.every(i => typeof(i) === "string")
}

//------------Creating Blog Model
const createBlogs = async  (req, res)=> {
  try {

    //Extract Data From Request Body
    let data = req.body;

    // Validate the blog data is present or not
    if (Object.keys(data).length == 0){ 
      return res.status(400).send({status: false,msg: "Invalid request !! Please Provide Blog Details" });
    }

    // Validate that authorId is coming or not in blog
    if (data.authorId.length==0){
      return res.status(400).send({ status: false, msg: "Please Provide Blog Author Id"})
    }
    data.authorId = data.authorId.trim();

    // Validate the authorId
    if (!isValidObjectId(data.authorId)){
    return res.status(400).send({status: false, msg: "AuthorId is invalid"});
    }

    // Storing Decoded Token into variable named decodedToken
    let decodedToken =  req.decodedToken
    // Authorize the author that is requesting to find blogs
    if( data.authorId != decodedToken.authorId ){
    return res.status(400).send({status: false , msg: "Author is Different"})
    }

    // Validate the title in blog
    let dv = /[a-zA-Z]/
    if ( data.title.length == 0 || ! dv.test(data.tile)){ 
    return res.status(400).send({status: false,msg: "Please Provide Blog Title"});
    }

    // Validate the body in blog
    if ( data.body.length == 0 || ! dv.test(data.body)){
    return res.status(400).send({status: false, msg: "Please Provide Blog Body"});
    }

    // Validate the category in blog
    if ( data.category.length == 0 || !(dv.test(data.category))){
    return res.status(400).send({status: false, msg: "Please Provide Blog category"});
    }
    data.category = data.category.toLowerCase().trim()

    // Validate the Tags in Blog
    if( data.tags != undefined && check(data.tags) == false){
      return res.status(400).send({ status: false, msg: "Please Provide Valid Tags"})
    }
 
    // Validate the Subcategory in Blogs
    if( data.subcategory != undefined &&  check(data.subcategory)== false){
        return res.status(400).send({ status: false, msg: "Please Provide Valid Subcategory"})
    }
    // data.subcategory = data.subcategory.toLowerCase().trim()  

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

    // Check Author Exists in database or not 
    let authorId = await authorModels.findById(data.authorId)
        
    if(!authorId){
    return res.status(400).send({status: false , msg:" Author is Not Present In Database"})   
    }
  
    // Lets Add the Date isPublished if True 
    if ( data.isPublished == true){
    data.publishedAt = new Date().toISOString();
    }

    // creating blog document for the valid author 
    let blogDetails = await blogModels.create(data);
    return res.status(201).send({status: true, msg: "Blog Created Successfully", data: blogDetails});
  }
  catch (err){
    return res.status(500).send({ status: false, err: err.message });
  }
};

//------------Getting Blogs by filter queries
const getBlogs = async  (req, res)=> {
  try {

    let queryData = req.query;

    // Check queries are coming or not
    if (Object.keys(queryData).length == 0){ 
      return res.status(400).send({ status: false, msg: "Invalid request !! Please Provide Blog Queries For Finding Blogs"})
    }

    // check whether this of data
    if (!(queryData.authorId ||queryData.category ||queryData.tags ||queryData.subcategory)){
      return res.status(400).send({ status: false, msg: "Invalid Filters!!!. Please Provide Valid Filters" });
    }
    
    // Storing Decoded Token into variable named decodedToken
    let decodedToken =  req.decodedToken
    // Authorize the author that is requesting to find blogs
    // Validate the authorId with help of decoded Token AuthorId if it is present in req.query
    if(queryData.authorId != null && queryData.authorId != decodedToken.authorId ){
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
    if (queryData.authorId && !isValidObjectId(queryData.authorId)){
      return res.status(400).send({ status: false, msg: "AuthorId is Invalid" });
    }
    
    // converting given fields to the proper format
    if( queryData.category) queryData.category = queryData.category.toLowerCase().trim()  // Remove the space in category and save in lowercase
    if( typeof queryData.tags == 'string') queryData.tags = queryData.tags.toLowerCase().trim()  // Remove the space in tags and save in lowercase
    if( typeof queryData.subcategory == 'string') queryData.subcategory = queryData.subcategory.toLowerCase().trim()   //Remove the space in subcategory and save in lowercase
  
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
  
    // We have to find blogs which are deleted and blogs which are published
    queryData.isDeleted = false;
    queryData.isPublished = true;
    const blogData = await blogModels.find(queryData);

    // Check that blogData Find has some result or not
    if (blogData.length == 0){
      return res.status(404).send({ status: false, msg: "Document Not Found" });
    }

    return res.status(200).send({ status: true,msg:"Blog Data Successfully Fetched", data: blogData });

  } catch (err) {
    return res.status(500).send({ status: false, err: err.message });
  }
};

//------------Updating blogs By ID by given requirement
const updateBlogs = async  (req, res) =>{
  try {

    let blog = req.body;

    //  check the blog data coming or not
    if (Object.keys(blog).length == 0){
      return res.status(400).send({status: false,msg: "Invalid request !! Please Provide Blog Details For Updating The Blog" });
    }

    // check query data
    if (! (blog.title || blog.body || blog.tags || blog.subcategory || blog.isPublished)){
      return res.status(400).send({ status: false, msg: "Invalid Filters!!!. Please Provide Valid Filters" });
    }
 
     //extract id from Path Params
    let blogId = req.params.blogId;
    let blogData = await blogModels.findById(blogId);

    if (!blogData || blogData.isDeleted == true){
      return res.status(404).send({ status: false, msg: "Document Not Found" });
    }

     // converting given tags Array and subcategory array elements into proper format
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
    if ( blogData.isPublished == false && blog.isPublished == true){
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
    res.status(200).send({status: true, msg: "Blog Updated Successfully", UpdatedData: updatedBlog });

  } catch (err) {
    return res.status(500).send({ status: false, err: err.message });
  }
};

//------------Delete Blogs By ID by given requirement
const deleteBlog = async  (req, res) =>{
  try {

    // Extract Blog id From Path params
    let blogId = req.params.blogId;

     // find blog data
    let blogData = await blogModels.findById(blogId);
   
    if (!blogData || blogData.isDeleted == true){
      res.status(404).send({ status: false, msg: "Data Not Found" });
    }

    blogData.isDeleted = true;
    blogData.deletedAt = new Date().toISOString();
    await blogData.save();
    return res.status(200).send();

  } catch (err) {
    return res.status(500).send({ status: false, err: err.message });
  }
};

//------------Updating blogs by given requirement i.e Deletion
const deleteByQuery = async  (req, res) =>{
  try {
    // Extract Data From Query Params
    let queryData = req.query;

     // Check queries are coming or not
     if (Object.keys(queryData).length == 0){ 
      return res.status(400).send({ status: false, msg: "Invalid request !! Please Provide Blog Details"})
     }

    // Authorize the author that is requesting to find blogs
    let decodedToken = req.decodedToken
    if( queryData.authorId  && decodedToken.authorId != queryData.authorId ){
     return res.status(403).send({status: false , msg: "Author is not allowed to perform this task"})
    } 
    
    // Store the Author Id from decoded Token to QueryData.AuthorId
    queryData.authorId = decodedToken.authorId;

    // Check if Valid delete queries Are Coming Or Not
    if (!(queryData.category || queryData.authorId || queryData.tags || queryData.subcategory)){
    return res.status(404).send({ status: false, msg: "Invalid Request...." });
    }
    
    // Check that author who is requesting to delete has valid id or not
    if (queryData.authorId && !(isValidObjectId(queryData.authorId))){
    return res.status(400).send( {status: false, msg: 'AuthorId is Invalid'})
   }

   // Check the Author is Exists in Author Collection Or not
   if(queryData.authorId){
    let authorId = await authorModels.findById(queryData.authorId)
    if(!authorId) { return res.status(404).send({status: false , msg:"Author not Found"}) } 
   }

  if(queryData.category) queryData.category = queryData.category.toLowerCase().trim()  // Remove the space in category and save in lowercase
  if(typeof queryData.tags == "string") queryData.tags = queryData.tags.toLowerCase().trim()  // Remove the space in tags and save in lowercase
  if(typeof queryData.subcategory == "string") queryData.subcategory = queryData.subcategory.toLowerCase().trim()   // Remove the space in subcategory and save in lowercase
  
  for (let key in queryData) {
    if (Array.isArray(queryData[key])) {
        let arr=[];
        for (let i = 0; i < queryData[key].length; i++) {
                if(queryData[key][i].trim().length>0)
            arr.push(queryData[key][i].toLowerCase().trim())
        }
        queryData[key] = [...arr];
        queryData[key] = {'$all': queryData[key]}
    }
  }

  // Ensuring that that data is not deleted
    if( queryData.isDeleted == true){
      console.log(queryData.isDeleted); 
      return res.status(400).send({status:false,msg:"Blog already deleted"}) 
     
    }
 
  // Finally Updating Blog Details
  let data1 = await blogModels.updateMany(
      queryData,
      { isDeleted: true, deletedAt: new Date().toISOString() },
      { new: true }
    );

  if( !data1){
  return res.status(404).send({status:false,msg:"No Match has Been Found"})  
  }
  
  return res.status(200).send({ status: true, status: "Blog Deleted Successfully", msg: data1 });
  } catch (err) {
    return res.status(500).send({ status: false, err: err.message });
  }
};


module.exports = {createBlogs , getBlogs, updateBlogs, deleteBlog, deleteByQuery}
