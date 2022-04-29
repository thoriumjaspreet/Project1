const authorModels = require("../models/authorModel.js");
const jwt = require("jsonwebtoken")



// CREATING AUTHOR
const createAuthor = async function (req, res) {
  try {
    let data = req.body;

    /// validate the data first
    if (Object.keys(data).length == 0) {
      return res.status(400).send({
        status: false,
        msg: "Invalid request !! Please Provide Author Details ",
      });
    }

    // validate the first name of author
    if (!data.fname) {
      return res.status(400).send({
        status: false,
        msg: "Please Provide Provide First Name Of Author ",
      });
    }

    // validate the Last Name of author
    if (!data.lname) {
      return res
        .status(400)
        .send({ status: false, msg: "Please Provide Last Name Of Author " });
    }

    // validate the email of author is Coming in data or not
    if (!data.email) {
      return res
        .status(400)
        .send({ status: false, msg: "Please Provide Email Of Author " });
    }
    // Validate the email correctly
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
      res.status(400).send({
        status: false,
        message: "Email should be a valid email address",
      });
    }

    // Validate the already existing email
    let alreadyExist = await authorModels.findOne({ email: data.email });
    if (alreadyExist) {
      res.status(400).send({
        status: false,
        message: "Email address is already registered",
      });
    }

    // validate the password of author
    if ((data.password).length < 8 ) {
      return res
        .status(400)
        .send({ status: false, msg: "Please Provide Password Of Author " });
    }

    // validate the title of author
    if (!["Mr", "Mrs", "Miss"].includes(data.title)) {
      return res.status(400).send({
        status: false,
        msg: "Title Must be of these values [Mr, Mrs, Miss] ",
      });
    }

    let author = await authorModels.create(data);
    res
      .status(200)
      .send({ status: true, msg: "Author Successfully Created", data: author });
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};


// LOGIN AUTHOR INTO IT
const loginAuthor = async function(req,res){
  try{
    
  // first checck that body is coming or not

  let data = req.body;
  let Authoremail = req.body.email;
  let Authorpassword = req.body.password;

  if(!data){
    return res.status(404).send({status:false,msg:"Please Enter Author Credentials!!"})
  }

  // validate the email of author is Coming in data or not
  if (!Authoremail) 
  {
    return res.status(400).send({ status: false, msg: "Please Provide Email Of Author " });
  }

  // Validate the email correctly
  if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(Authoremail)) 
  {
    res.status(400).send({status: false,message: "Email should be a valid email address"});
  }

  // validate the password of author
  if (!Authorpassword) 
  { 
   return res.status(400).send({ status: false, msg: "Please Provide Password Of Author " });
  }
 
  // Find Author in Author Collection
  let author = await authorModels.findOne({ email : Authoremail , password : Authorpassword })
  
  // Generating JWT  
  let token = jwt.sign({ authorId: author._id.toString(), Name: "Author"},"Blogging-Site" )
  
  // Send the token to Response Header
  res.setHeader("x-api-key", token);

  // send response to  user that Author is successfully logined
  res.status(200).send({status: true, message: "Author login successfully", data: { token }});

  }catch (err) 
  {
    res.status(500).send({ status: false, msg: err.message });
  }

}

module.exports.createAuthor = createAuthor;
module.exports.loginAuthor = loginAuthor;
