const authorModel = require("../models/authorModel.js");
const jwt = require("jsonwebtoken")
const {
  isValid,
  isValid2,
  isValidEmail,
  isValidPassword,
  isValidBody
} = require('../utils/validator')

// CREATING AUTHOR
const createAuthor = async function (req, res) {
  try {

    const { fname, lname, title, email, password } = req.body

    // Validate the req body first
    if (!isValidBody(req.body)) {
      return res.status(400).send({ status: false, msg: "Invalid request !! Please Provide Author Details " });
    }

    // Validate the first name of author

    if (!isValid(fname)) {
      return res.status(400).send({ status: false, msg: "Please Provide  First Name Of Author " });
    }


    // Valid only string and  Match With Regex Exp.
    if (!isValid2(fname)) {
      return res.status(400).send({ status: false, msg: "Please Provide Valid First Name Of Author " });
    }


    // Validate the Last Name of author
    if (!isValid(lname)) {
      return res.status(400).send({ status: false, msg: "Please Provide Last Name Of Author " });
    }

    if (!isValid2(lname)) {
      return res.status(400).send({ status: false, msg: "Please Provide Valid Last Name Of Author " });
    }


    // Validate the title of author
    if (!["Mr", "Mrs", "Miss"].includes(title)) {
      return res.status(400).send({ status: false, msg: "Title Must be of these values [Mr, Mrs, Miss] " });
    }

    // Validate the email of author is Coming in data or not
    if (!isValid(email)) {
      return res.status(400).send({ status: false, msg: "Please Provide Email Of Author " });
    }

    // Method for Email Validation using Regular Expression
    if (!isValidEmail(email)) {
      return res.status(400).send({ status: false, msg: "Invalid EmailId Address" })
    }

    // Validate the already existing email
    let alreadyExist = await authorModels.findOne({ email: email });
    if (alreadyExist) {
      return res.status(400).send({ status: false, message: "Email address is already registered" });
    }

    // Validate the email of author is Coming in data or not
    if (!isValid(password)) {
      return res.status(400).send({ status: false, msg: "Please Provide Password Of Author " });
    }

    // Validate the password of author
    if (!isValidPassword(password)) {
      return res.status(400).send({ status: false, msg: "Invalid Password !!" });
    }  

  

    const author = await authorModels.create(req.body);
    let token = jwt.sign({ authorId: author._id.toString(), Name: author.fname }, "Blogging-Site")
    return res.status(200).send({ status: true, msg: "Author Successfully Created", data: author ,token });

  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

// LOGIN AUTHOR INTO IT
const loginAuthor = async function (req, res) {

  try {

    // First check that body is coming or not
    let { email, password } = req.body;

    if (!isValidBody(req.body)) {
      return res.status(404).send({ status: false, msg: "Please Enter Author Credentials!!" })
    }

    // Validate the email of author is Coming in data or not
    if (!isValid(email)) {
      return res.status(400).send({ status: false, msg: "Please Provide Email Of Author" });
    }

    // Validate the email correctly
    if (!isValidEmail(email)) {
      return res.status(400).send({ status: false, message: "Email should be a valid email address" });
    }

    // Validate the password of author
    if (!isValid(password)) {
      return res.status(400).send({ status: false, msg: "Please Provide Password Of Author " });
    }

    // Find Author in Author Collection
    let author = await authorModel.findOne({ email: email, password: password })

    if (!author) {
      return res.status(400).send({ status: false, message: "Invalid Credentials" });
    }
    // Generating JWT  
    let token = jwt.sign({ authorId: author._id.toString(), Name: author.fname }, "Blogging-Site")

    let authorId = author._id
    // Send the token to Response Header
    // res.setHeader("authorization", token);

    // send response to  user that Author is successfully logged in
    return res.status(200).send({ status: true, message: "Author login successfully", data: { token, authorId } });

  }
  catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
}

module.exports = { createAuthor, loginAuthor };

