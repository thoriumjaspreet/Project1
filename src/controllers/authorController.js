const authorModel = require("../models/authorModel");
const jwt=require("jsonwebtoken")
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
    let alreadyExist = await authorModel.findOne({ email: data.email });
    if (alreadyExist) {
      res.status(400).send({
        status: false,
        message: "Email address is already registered",
      });
    }

    // validate the password of author
    if (data.password < 8) {
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

    let author = await authorModel.create(data);
    res
      .status(200)
      .send({ status: true, msg: "Author Successfully created", data: author });
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};



const loginAuthor = async function (req, res) {
  try{
    let data = req.body;
  let authorMail = req.body.email;
  let password = req.body.password;



  
  
  if(!data){
    return res.status(404).send({status:false,msg:"Please Enter Author Credentials!!"})
  }

  // let auhor1 = await authorModel.findOne({ emailId: authorMail, password: password });
  // if (!auhor1){
    if (!authorMail) {
      return res
        .status(400)
        .send({ status: false, msg: "Please Provide Email Of Author " });
    }
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
      res.status(400).send({
        status: false,
        message: "Email should be a valid email address",
      });
    }
    if (!password) {
      return res
        .status(400)
        .send({ status: false, msg: "Please Provide Password Of Author " });

    }
    let Author1 = await authorModel.findOne({email: authorMail,pasword: password});
    
    //generate jwt
    let token = jwt.sign(
      {
       authorId:Author1._id.toString(),
       Name: "Author"
        // organisation: "FUnctionUp",
      },
      "Author-blogging"
    );
    // Send the token to Response Header
  res.setHeader("x-api-key", token);

  

    res.status(200).send({status: true, message: "Author login successfully", data: { token }});



  } 
  //}
  catch(error){
    console.log("this is the error:",error.meassage)
    res.status(500).send({msg:"error",error:error.meassage})
  }
    };
    
















module.exports.createAuthor = createAuthor;
module.exports.loginAuthor=loginAuthor
