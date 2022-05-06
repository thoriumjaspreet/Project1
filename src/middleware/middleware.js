const jwt =require("jsonwebtoken")
const mongoose = require("mongoose");
const isValidObjectId = function (objectId) {
  return mongoose.Types.ObjectId.isValid(objectId);
};
const blogModels= require("../models/blogModel.js")



const login = async function(req,res,next){


    try{


    // take token from client 
    let token = req.headers["x-Api-key"]

    if( token == undefined ) { token= req.headers["x-api-key"] }

    //If no token is present in the request header return error
    if (!token) return res.status(401).send({ status: false, msg: "Token must be present" });

    //if token is present then decode the token
    let decodedToken = jwt.verify(token,"Blogging-Site")
    
    // Check Decoded token is here or not
    if(!decodedToken) return res.status(401).send({ status : false, msg : "Token is Not Present"})

    req.decodedToken = decodedToken 
    // if Everything is ok then we head towards Api's
    next();

}catch(err)
{
res.status(401).send({ status: false, err : "Token is Invalid" })
}
}


const AuthorizationById = async function (req, res, next) {
  try {
    let BlogId =req.params.blogId
    if (!isValidObjectId(BlogId))
    {
      return res.status(400).send({ status: false, msg: "Invalid Blog-Id" });
    }

    let blogData = await blogModels.findById(BlogId);
    // Extract AuthorId for which the request is made. In this case message to be posted Or Want to update And Delete Something.
    let BlogToBeModified = blogData.authorId;

    // Extract AuthorId for the logged-in user
    let decodedToken =  req.decodedToken
    let AuthorLoggedIn = decodedToken.authorId;

    // AuthorId comparison to check if the logged-in Author is requesting for their own data
    if (BlogToBeModified != AuthorLoggedIn)
    {
    return res.status(401).send({ status: false, msg: "Author Logged in is not Allowed to Modify the Requested Blog Data"});
    }

    next();
  }
  catch (err) {
    res.status(500).send({ status: false, err: err.message });
  }
};


module.exports.AuthorizationById = AuthorizationById ;
module.exports.login = login;