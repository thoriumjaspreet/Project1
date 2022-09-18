const jwt = require("jsonwebtoken")
const mongoose = require("mongoose");
const isValidObjectId = function (objectId) {
  return mongoose.Types.ObjectId.isValid(objectId);
};
const blogModels = require("../models/blogModel.js")



const login = async (req,res,next)=>{

  try{

  // take token from client 
  // take token from client 
  let token1 = req.headers["x-Api-key"]

  if( token1 == undefined ) { token1= req.headers["x-api-key"] }

  // if( token1 == undefined ) { token= req.headers["Authorization"] }

      // if No token found then send error
      if (!token1) {
        return res.status(401).send({ status: false, msg: "Authentication token is required" })
      }

          // Split that Bearer Token 
       // let token = token1.split(' ')[1]


  // Now Verify that token in Decoded Token
  // jwt.verify(token1, "Blogging-Site", { ignoreExpiration: true }, function (err, decoded) {
  //   if (err) { 
  //     return res.status(400).send({ status: false, meessage: "token invalid" }) }
  //   else {
  //     if (Date.now() > decoded.exp * 1000) {
  //       return res.status(401).send({ status: false, msg: "Session Expired", });
  //     }

jwt.verify(token1,"Blogging-Site",{ignoreExpiration:true},function(err,decoded){
  if(err){
    return res.send({status:false,message:"token invalid"})
  }
  else{
  if(Date.now()>decoded.exp*1000){
    return res.status(401).send({ status: false, msg: "Session Expired", });
}
  

     
     // Store Decoded Token User Id into request header named as userId
     req.decodedToken = decoded;
     
     // Now Simply Next the flow 
     next();
    }
  });

}
catch(err)
{
  res.status(500).send({ msg: "Error", error: err.message })
}
}


const AuthorizationById = async function (req, res, next) {

  try {

    let BlogId = req.params.blogId
    
    if (!isValidObjectId(BlogId)) {
      return res.status(400).send({ status: false, msg: "Invalid Blog-Id" });
    }

    let blogData = await blogModels.findById(BlogId);
    
    // Extract AuthorId for which the request is made. In this case message to be posted Or Want to update And Delete Something.
    let BlogToBeModified = blogData.authorId;

    // Extract AuthorId for the logged-in user
    let decodedToken = req.decodedToken
    let AuthorLoggedIn = decodedToken.authorId;

    // AuthorId comparison to check if the logged-in Author is requesting for their own data
    if (BlogToBeModified.toString() != AuthorLoggedIn) {
      return res.status(401).send({ status: false, msg: "Author Logged in is not Allowed to Modify the Requested Blog Data" });
    }
    next();

  }
  catch (err) {
    res.status(500).send({ status: false, err: err.message });
  }
};


module.exports.AuthorizationById = AuthorizationById;
module.exports.login = login;
