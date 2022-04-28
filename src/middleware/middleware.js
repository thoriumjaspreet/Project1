const jwt =require("jsonwebtoken")


const login = async function(req,res,next){


    try{


    // take token from client 
    let token = req.headers["x-Api-key"]

    if( token == undefined ) { token= req.headers["x-api-key"] }

    //If no token is present in the request header return error
    if (!token) return res.status(401).send({ status: false, msg: "Token must be present" });

    //if token is present then decode the token
    let decodedToken = jwt.verify(token,"Blogging-Site")
    
    // check Decoded token is here or not
    if(!decodedToken) return res.status(401).send({ status : false, msg : "Token is Invalid"})

    req.decodedToken = decodedToken 
    // if Everything is ok then we head towards Api's
    next()

}catch(err)
{
    res.status(500).send({ status: false, err : err.message })
}
}


const Authorization = async function (req, res, next) {
  try {
    
    // Extract BlogId for which the request is made. In this case message to be posted Or Want to update And Delete Something.
    let BlogToBeModified = req.params.blogId;

    // Extract AuthorId for the logged-in user
    let  decodedToken = req.decodedToken
    let AuthorLoggedIn = decodedToken.authorId;

    // AuthorId comparision to check if the logged-in Author is requesting for their own data
    if (BlogToBeModified != AuthorLoggedIn){
    return res.send({ status: false, msg: "Author Logged in is not Allowed to Modify the Requested Blog Data"});
    }
    next();
  } catch (err) {
    res.status(500).send({ status: false, Error: error.message });
  }
};


module.exports.Authorization = Authorization ;
module.exports.login = login;