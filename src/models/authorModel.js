const mongoose = require("mongoose");
const validator=require("validator")

const newSchema = new mongoose.Schema(
  {
    fname: {
      type:String,
      required:"First Name is Required" ,
      trim:true
    },
    lname: {
      type:String,
      required:"Last Name is Required",
      trim:true
    },
    title: {
      type: String,
      required: true,
      enum: ["Mr", "Mrs", "Miss"],
      required:"Title is Required"
    },
    email: {
      type: String,
      unique: true,
      lowercase:true,
      required: "Email is Required",
      trim:true,
      validate:{
        validator: function(email) {
          return validator.isEmail(email)
        },msg:"Please Fill a Valid Email Address", isAsync: false
      }
    },
    password: {
      type: String,
      required: "Password is Required",
      trim:true
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Author", newSchema);
