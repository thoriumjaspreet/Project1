const authorModels = require("../models/authorModel.js");
const jwt = require("jsonwebtoken")



// CREATING AUTHOR
const createAuthor = async function (req, res) {
  try {
    
    let data = req.body;

    // Validate the data first
    if (Object.keys(data).length == 0) {
      return res.status(400).send({ status: false, msg: "Invalid request !! Please Provide Author Details "});
    }

    // Validate the first name of author Or Match With Regex Exp.
    const dv = /[a-zA-Z]/;
    if ( data.fname.length == 0 || !dv.test(data.fname)) {
      return res.status(400).send({status: false, msg: "Please Provide Provide First Name Of Author "});
    }

    // Validate the Last Name of author
    if (! data.lname|| !dv.test(data.lname)) {
      return res.status(400).send({ status: false, msg: "Please Provide Last Name Of Author " });
    }

    // Validate the title of author
    if (!["Mr", "Mrs", "Miss"].includes(data.title)) {
      return res.status(400).send({status: false,msg: "Title Must be of these values [Mr, Mrs, Miss] "});
    }

    // Validate the email of author is Coming in data or not
    if ( data.email.length == 0 ) {
      return res.status(400).send({ status: false, msg: "Please Provide Email Of Author " });
    }
   
    // Method for Email Validation using Regular Expression
    const re = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,20}$/; 
    if(! re.test(data.email)){ 
        return res.status(400).send({status: false , msg: "Invalid EmailId Address "})
    }

    // Validate the already existing email
    let alreadyExist = await authorModels.findOne({ email: data.email });
    if (alreadyExist) {
      res.status(400).send({ status: false, message: "Email address is already registered"});
    } 

    // Validate the password of author
    const passRE = /^(?!\S*\s)(?=\D*\d)(?=.*[!@#$%^&*])(?=[^A-Z]*[A-Z]).{8,15}$/;
    if ( ! passRE.test(data.password)) {
      return res.status(400).send({ status: false, msg: "Please Provide Password Of Author " });
    }
    
    const author = await authorModels.create(data);
    return res.status(200).send({ status: true, msg: "Author Successfully Created", data: author });

  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};


// LOGIN AUTHOR INTO IT
const loginAuthor = async function(req,res){
  
  try{
    
  // First check that body is coming or not

  let data = req.body;
  let authorEmail = req.body.email;
  let authorPassword = req.body.password;

  if( Object.keys(data).length == 0){
    return res.status(404).send({status:false,msg:"Please Enter Author Credentials!!"})
  }

  // Validate the email of author is Coming in data or not
  if (!authorEmail){
    return res.status(400).send({ status: false, msg: "Please Provide Email Of Author " });
  }

  // Validate the email correctly
  if (! (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).test(authorEmail)){
   return res.status(400).send({status: false,message: "Email should be a valid email address"});
  }

  // Validate the password of author
  if (!authorPassword){ 
   return res.status(400).send({ status: false, msg: "Please Provide Password Of Author " });
  }
 
  // Find Author in Author Collection
  let author = await authorModels.findOne({ email : authorEmail , password : authorPassword })
  
  // Generating JWT  
  let token = jwt.sign({ authorId: author._id.toString(), Name: "Author"},"Blogging-Site" )
  
  // Send the token to Response Header
  res.setHeader("x-api-key", token);

  // send response to  user that Author is successfully logged in
  res.status(200).send({status: true, message: "Author login successfully", data: { token }});

  }catch (err){
    res.status(500).send({ status: false, msg: err.message });
  }
}

module.exports = { createAuthor, loginAuthor };

